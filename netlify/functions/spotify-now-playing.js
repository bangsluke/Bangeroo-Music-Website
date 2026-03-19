function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, s-maxage=30",
      "access-control-allow-origin": "*"
    },
    body: JSON.stringify(body)
  };
}

function normalizeEnv(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

async function getAccessToken() {
  const rawClientId = process.env.SPOTIFY_CLIENT_ID;
  const rawClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const rawRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  const clientId = normalizeEnv(rawClientId);
  const clientSecret = normalizeEnv(rawClientSecret);
  const refreshToken = normalizeEnv(rawRefreshToken);

  console.log("[spotify-now-playing] Env variable metadata", {
    hasClientId: Boolean(clientId),
    hasClientSecret: Boolean(clientSecret),
    hasRefreshToken: Boolean(refreshToken),
    clientIdLength: clientId.length,
    clientSecretLength: clientSecret.length,
    refreshTokenLength: refreshToken.length,
    normalizedClientId: rawClientId !== clientId,
    normalizedClientSecret: rawClientSecret !== clientSecret,
    normalizedRefreshToken: rawRefreshToken !== refreshToken
  });

  if (!clientId || !clientSecret || !refreshToken) {
    console.log("[spotify-now-playing] Missing environment variables", {
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
      hasRefreshToken: Boolean(refreshToken)
    });
    throw new Error("Spotify environment variables are missing");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret
  });

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body
  });
  if (!tokenResponse.ok) {
    let tokenErrorBody = "";
    try {
      tokenErrorBody = await tokenResponse.text();
    } catch {
      tokenErrorBody = "";
    }

    console.log("[spotify-now-playing] Token refresh failed", {
      status: tokenResponse.status,
      body: tokenErrorBody
    });
    throw new Error(`Failed to refresh Spotify token (status ${tokenResponse.status})${tokenErrorBody ? `: ${tokenErrorBody}` : ""}`);
  }
  const tokenData = await tokenResponse.json();
  console.log("[spotify-now-playing] Token refresh successful");
  return tokenData.access_token;
}

export async function handler(event) {
  console.log("[spotify-now-playing] Request received", {
    method: event.httpMethod,
    path: event.path
  });

  if (event.httpMethod !== "GET") {
    console.log("[spotify-now-playing] Rejected method", { method: event.httpMethod });
    return response(405, { error: "Method not allowed" });
  }

  try {
    const token = await getAccessToken();
    const currentlyPlayingResponse = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          authorization: `Bearer ${token}`
        }
      }
    );

    if (currentlyPlayingResponse.status === 204) {
      console.log("[spotify-now-playing] No active playback (204)");
      return response(200, { isPlaying: false });
    }
    if (!currentlyPlayingResponse.ok) {
      console.log("[spotify-now-playing] currently-playing call failed", {
        status: currentlyPlayingResponse.status
      });
      return response(200, { isPlaying: false });
    }

    const payload = await currentlyPlayingResponse.json();
    if (!payload?.is_playing || !payload?.item) {
      console.log("[spotify-now-playing] Payload indicates not playing");
      return response(200, { isPlaying: false });
    }

    const trackName = payload.item.name;
    const artistName = (payload.item.artists || []).map((artist) => artist.name).join(", ");
    console.log("[spotify-now-playing] Active playback detected", {
      track: trackName,
      artist: artistName
    });

    return response(200, {
      isPlaying: true,
      track: trackName,
      artist: artistName,
      albumArt: payload.item.album?.images?.[0]?.url || ""
    });
  } catch (error) {
    console.log("[spotify-now-playing] Handler error", { message: error.message });
    return response(200, { isPlaying: false, error: error.message });
  }
}
