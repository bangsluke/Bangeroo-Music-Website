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

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
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
    throw new Error("Failed to refresh Spotify token");
  }
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

export async function handler(event) {
  if (event.httpMethod !== "GET") {
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
      return response(200, { isPlaying: false });
    }
    if (!currentlyPlayingResponse.ok) {
      return response(200, { isPlaying: false });
    }

    const payload = await currentlyPlayingResponse.json();
    if (!payload?.is_playing || !payload?.item) {
      return response(200, { isPlaying: false });
    }

    return response(200, {
      isPlaying: true,
      track: payload.item.name,
      artist: (payload.item.artists || []).map((artist) => artist.name).join(", "),
      albumArt: payload.item.album?.images?.[0]?.url || ""
    });
  } catch (error) {
    return response(200, { isPlaying: false, error: error.message });
  }
}
