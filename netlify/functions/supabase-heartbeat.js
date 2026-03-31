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
      return response(500, {
        error: "Supabase heartbeat query failed",
        detail: error.message,
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
    return response(500, {
      error: "Supabase heartbeat request crashed",
      detail: err instanceof Error ? err.message : String(err),
      host: new URL(supabaseUrl).host
    });
  }
}
