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

async function restHeartbeat(supabaseUrl, supabaseServiceKey) {
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
        detail: `REST heartbeat failed with status ${res.status}: ${text.slice(0, 200)}`
      };
    }

    return { ok: true, detail: text.slice(0, 200) };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : String(err)
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
    const { data, error } = await supabase.from("visitor_count").select("id").limit(1);

    if (error) {
      const fallback = await restHeartbeat(supabaseUrl, supabaseServiceKey);
      return response(fallback.ok ? 200 : 500, {
        ok: fallback.ok,
        error: "Supabase heartbeat query failed via SDK",
        detail: error.message,
        fallbackDetail: fallback.detail,
        host: new URL(supabaseUrl).host
      });
    }

    return response(200, {
      ok: true,
      checkedAt: new Date().toISOString(),
      rowsChecked: data?.length ?? 0,
      host: new URL(supabaseUrl).host
    });
  } catch (err) {
    const fallback = await restHeartbeat(supabaseUrl, supabaseServiceKey);
    if (fallback.ok) {
      return response(200, {
        ok: true,
        checkedAt: new Date().toISOString(),
        host: new URL(supabaseUrl).host,
        note: "SDK path failed; REST fallback succeeded",
        sdkError: err instanceof Error ? err.message : String(err)
      });
    }

    return response(500, {
      error: "Supabase heartbeat request crashed",
      detail: err instanceof Error ? err.message : String(err),
      fallbackDetail: fallback.detail,
      host: new URL(supabaseUrl).host
    });
  }
}
