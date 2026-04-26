import { createClient } from "@supabase/supabase-js";

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

function errorDetail(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && "message" in err) return String(err.message);
  return String(err);
}

function isHeartbeatTableMissing(detail) {
  return /heartbeat_log|relation .* does not exist|PGRST205|42P01/i.test(detail);
}

async function restWriteHeartbeat(supabaseUrl, supabaseServiceKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const heartbeatAt = new Date().toISOString();

  try {
    const res = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/rest/v1/heartbeat_log?on_conflict=id`,
      {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "content-type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify([
          {
            id: 1,
            source: "netlify-heartbeat",
            last_seen_at: heartbeatAt
          }
        ]),
        signal: controller.signal
      }
    );

    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        detail: `REST write heartbeat failed with status ${res.status}: ${text.slice(0, 300)}`
      };
    }

    return { ok: true, heartbeatAt, detail: text.slice(0, 300) };
  } catch (err) {
    return {
      ok: false,
      detail: errorDetail(err)
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function restReadHeartbeat(supabaseUrl, supabaseServiceKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/rest/v1/visitor_count?select=id&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`
        },
        signal: controller.signal
      }
    );

    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        detail: `REST read fallback failed with status ${res.status}: ${text.slice(0, 300)}`
      };
    }

    return { ok: true, detail: text.slice(0, 300) };
  } catch (err) {
    return {
      ok: false,
      detail: errorDetail(err)
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return response(405, { error: "Method not allowed" });
  }

  const heartbeatToken = process.env.HEARTBEAT_TOKEN;
  const providedToken =
    event.headers?.["x-heartbeat-token"] || event.headers?.["X-Heartbeat-Token"];

  if (!heartbeatToken) {
    return response(500, { error: "Heartbeat token is not configured" });
  }

  if (!providedToken || providedToken !== heartbeatToken) {
    return response(401, { error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return response(500, { error: "Supabase is not configured" });
  }

  if (!/^https?:\/\//i.test(supabaseUrl)) {
    return response(500, {
      error: "SUPABASE_URL is invalid",
      detail: "SUPABASE_URL must start with http:// or https://",
      host: String(supabaseUrl).slice(0, 60)
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const heartbeatAt = new Date().toISOString();
    const { error } = await supabase.from("heartbeat_log").upsert(
      {
        id: 1,
        source: "netlify-heartbeat",
        last_seen_at: heartbeatAt
      },
      { onConflict: "id" }
    );

    if (error) throw error;
    return response(200, {
      ok: true,
      heartbeatMode: "write-sdk",
      heartbeatAt,
      host: new URL(supabaseUrl).host
    });
  } catch (err) {
    const sdkError = errorDetail(err);
    const writeFallback = await restWriteHeartbeat(supabaseUrl, supabaseServiceKey);
    if (writeFallback.ok) {
      return response(200, {
        ok: true,
        heartbeatMode: "write-rest-fallback",
        heartbeatAt: writeFallback.heartbeatAt,
        host: new URL(supabaseUrl).host,
        note: "SDK write failed; REST write fallback succeeded",
        sdkError
      });
    }

    const readFallback = await restReadHeartbeat(supabaseUrl, supabaseServiceKey);
    if (readFallback.ok) {
      return response(200, {
        ok: true,
        heartbeatMode: "read-fallback",
        checkedAt: new Date().toISOString(),
        host: new URL(supabaseUrl).host,
        warning: isHeartbeatTableMissing(sdkError)
          ? "Write heartbeat unavailable. Create heartbeat_log table to enforce write-based keepalive."
          : "Write heartbeat failed; read fallback succeeded.",
        sdkError,
        writeFallbackDetail: writeFallback.detail
      });
    }

    return response(500, {
      error: "Supabase heartbeat request crashed",
      detail: sdkError,
      writeFallbackDetail: writeFallback.detail,
      readFallbackDetail: readFallback.detail,
      setupHint:
        "Create table heartbeat_log(id int primary key, source text not null, last_seen_at timestamptz not null default now()).",
      host: new URL(supabaseUrl).host
    });
  }
}
