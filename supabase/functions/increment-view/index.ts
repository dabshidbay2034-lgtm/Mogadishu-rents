import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { property_id } = await req.json();

    if (!property_id) {
      return new Response(
        JSON.stringify({ error: "property_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service-role client — bypasses RLS for rate-limit table and view counter
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve the calling user (if authenticated)
    let currentUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const {
        data: { user },
      } = await userClient.auth.getUser();
      currentUserId = user?.id ?? null;
    }

    // Build a viewer key: auth user_id takes precedence, else fall back to IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const viewerKey = currentUserId ?? `ip:${ip}`;

    // Fetch the property's owner
    const { data: property, error: propError } = await adminClient
      .from("properties")
      .select("owner_id")
      .eq("id", property_id)
      .single();

    if (propError || !property) {
      return new Response(
        JSON.stringify({ error: "Property not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Skip — owner is viewing their own property
    if (currentUserId && property.owner_id === currentUserId) {
      return new Response(
        JSON.stringify({ counted: false, reason: "owner" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate-limit: one counted view per viewer+property per 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await adminClient
      .from("property_view_logs")
      .select("id")
      .eq("property_id", property_id)
      .eq("viewer_key", viewerKey)
      .gte("viewed_at", since)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ counted: false, reason: "rate_limited" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log this view (used for the rate-limit check above)
    await adminClient
      .from("property_view_logs")
      .insert({ property_id, viewer_key: viewerKey });

    // Increment the view counter on the property row
    const { error: rpcError } = await adminClient.rpc(
      "increment_property_view",
      { property_id }
    );
    if (rpcError) throw rpcError;

    return new Response(
      JSON.stringify({ counted: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
