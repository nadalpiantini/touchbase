import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(req: Request) {
  try {
    const s = await supabaseServer();
    const user = await requireAuth(s);

    const { data: cur } = await s.rpc("touchbase_current_org");
    const current = cur?.[0];
    
    if (!current?.org_id) {
      return NextResponse.json({ error: "No default org" }, { status: 400 });
    }

    const [budgetsRes, expensesRes] = await Promise.all([
      s.from("touchbase_budgets")
        .select("*")
        .eq("org_id", current.org_id)
        .is("deleted_at", null),
      s.from("touchbase_expenses")
        .select("*")
        .eq("org_id", current.org_id)
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

