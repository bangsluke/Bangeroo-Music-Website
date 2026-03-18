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

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return response(405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return response(500, { error: "Supabase is not configured" });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase.from("visitor_count").select("count").eq("id", 1).single();
  if (error) {
    return response(500, { error: error.message });
  }

  const nextCount = Number(data?.count || 0) + 1;
  const { error: updateError } = await supabase
    .from("visitor_count")
    .update({ count: nextCount })
    .eq("id", 1);

  if (updateError) {
    return response(500, { error: updateError.message });
  }

  return response(200, { count: nextCount });
}
