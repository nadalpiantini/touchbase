import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/middleware-helpers";
import { isDevMode, DEV_ORG_ID } from "@/lib/dev-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    const { data: { user } } = await s.auth.getUser();

    // DEV MODE: Allow access without auth
    if (!user && !isDevMode()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let orgId: string | null = null;

    if (user) {
      const { data: cur } = await s.rpc("touchbase_current_org");
      orgId = cur?.[0]?.org_id;
    } else if (isDevMode()) {
      orgId = DEV_ORG_ID;
    }

    if (!orgId) {
      return NextResponse.json({ error: "No default org" }, { status: 400 });
    }

    // Use admin client in dev mode to bypass RLS
    const client = isDevMode() && !user ? supabaseAdmin() : s;

    const [budgetsRes, expensesRes] = await Promise.all([
      client.from("touchbase_budgets")
        .select("*")
        .eq("org_id", orgId)
        .is("deleted_at", null),
      client.from("touchbase_expenses")
        .select("*")
        .eq("org_id", orgId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
    ]);

    return NextResponse.json({
      budgets: budgetsRes.data || [],
      expenses: expensesRes.data || []
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get budget data" },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireAuth(s);

    const { data: cur } = await s.rpc("touchbase_current_org");
    const current = cur?.[0];
    
    if (!current?.org_id) {
      return NextResponse.json({ error: "No default org" }, { status: 400 });
    }

    const body = await req.json();
    const { type, ...data } = body;

    if (type === "budget") {
      const { data: budget, error } = await s
        .from("touchbase_budgets")
        .insert({
          org_id: current.org_id,
          category: data.category,
          allocated_amount: data.allocated_amount,
          fiscal_year: data.fiscal_year || new Date().getFullYear(),
          notes: data.notes
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, id: budget.id });
    } else if (type === "expense") {
      const { data: expense, error } = await s
        .from("touchbase_expenses")
        .insert({
          org_id: current.org_id,
          budget_id: data.budget_id,
          category: data.category,
          amount: data.amount,
          description: data.description,
          receipt_url: data.receipt_url,
          created_by: user.id
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, id: expense.id });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create" },
      { status: 400 }
    );
  }
}

