import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const entity = url.searchParams.get("entity"); // 'team' | 'player' | null
  const action = url.searchParams.get("action"); // create|update|soft_delete|restore|purge | null
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);

  let query = s.from("touchbase_audit_log")
    .select("id, org_id, entity, entity_id, action, actor, meta, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (entity) query = query.eq("entity", entity);
  if (action) query = query.eq("action", action);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ logs: data ?? [] });
}
