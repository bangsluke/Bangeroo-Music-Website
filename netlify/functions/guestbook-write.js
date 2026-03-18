import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*"
    },
    body: JSON.stringify(body)
  };
}

function stripHtml(input) {
  return String(input).replace(/<[^>]*>/g, "").trim();
}

function hashIp(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return response(405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return response(500, { error: "Supabase is not configured" });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { error: "Invalid JSON payload" });
  }

  const message = stripHtml(payload.message || "");
  if (!message || message.length > 100) {
    return response(400, { error: "Message must be 1-100 characters" });
  }

  const forwardedFor = event.headers["x-forwarded-for"] || "unknown";
  const ip = forwardedFor.split(",")[0].trim();
  const ipHash = hashIp(ip);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date();
  const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000).toISOString();

  const { data: recent, error: recentError } = await supabase
    .from("guestbook")
    .select("id")
    .eq("ip_hash", ipHash)
    .gte("created_at", sixtySecondsAgo)
    .limit(1);

  if (recentError) {
    return response(500, { error: recentError.message });
  }
  if (recent && recent.length > 0) {
    return response(429, { error: "Please wait before posting again" });
  }

  const { error } = await supabase.from("guestbook").insert({ message, ip_hash: ipHash });
  if (error) {
    return response(500, { error: error.message });
  }

  return response(200, { success: true });
}
