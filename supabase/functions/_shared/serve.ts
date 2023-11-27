import { corsHeaders } from "./cors.ts";
import {
  SupabaseClient,
  User,
  createClient,
} from "https://esm.sh/@supabase/supabase-js@2";

import { Json, Database as DatabaseGenerated } from "./supabaseTypes.ts";
export type { Json } from "./supabaseTypes.ts";

export function serve(
  body: (
    req: Request,
    supabase: SupabaseClient<DatabaseGenerated>,
    user: User | null
  ) => Promise<Json>
) {
  Deno.serve(async (req) => {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the session or user object
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    const data = await body(req, supabase, user);

    try {
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  });
}
