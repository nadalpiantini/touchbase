"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, LoadingSpinner, Alert, useToast } from "@/components/ui";

type Budget = {
  id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  fiscal_year?: number;
};

type Expense = {
  id: string;
  category: string;
  amount: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function BudgetingPage() {
  const { addToast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Form states
  const [budgetForm, setBudgetForm] = useState({ category: "", allocated_amount: "", fiscal_year: new Date().getFullYear(), notes: "" });
  const [expenseForm, setExpenseForm] = useState({ category: "", amount: "", description: "", budget_id: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/budgeting");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setBudgets(data.budgets || []);
      setExpenses(data.expenses || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar datos de presupuesto");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/budgeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "budget",
          ...budgetForm,
          allocated_amount: parseFloat(budgetForm.allocated_amount),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setShowAddBudget(false);
      setBudgetForm({ category: "", allocated_amount: "", fiscal_year: new Date().getFullYear(), notes: "" });
      loadData();
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Error al crear presupuesto", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/budgeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "expense",
          ...expenseForm,
          amount: parseFloat(expenseForm.amount),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setShowAddExpense(false);
      setExpenseForm({ category: "", amount: "", description: "", budget_id: "" });
      loadData();
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Error al crear gasto", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  const totalSpent = expenses
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = totalAllocated - totalSpent;

  if (loading) {
    return <LoadingSpinner text="Cargando presupuesto..." />;
  }

  if (error) {
    return (
      <Alert variant="error" title="Error">
        {error}
        <Button onClick={loadData} className="mt-4">
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-tb-navy">Presupuesto y Finanzas</h1>
        <p className="text-tb-shadow mt-1">Gestiona el presupuesto y gastos de tu organización</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Asignado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tb-navy">
              ${totalAllocated.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Gastado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tb-red">
              ${totalSpent.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${remaining.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Budget Form */}
      {showAddBudget && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Presupuesto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Categoría *
                </label>
                <input
                  type="text"
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-2">
                    Monto Asignado *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={budgetForm.allocated_amount}
                    onChange={(e) => setBudgetForm({ ...budgetForm, allocated_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-2">
                    Año Fiscal
                  </label>
                  <input
                    type="number"
                    value={budgetForm.fiscal_year}
                    onChange={(e) => setBudgetForm({ ...budgetForm, fiscal_year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Notas
                </label>
                <textarea
                  value={budgetForm.notes}
                  onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creando..." : "Crear Presupuesto"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddBudget(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Budgets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Presupuestos por Categoría</CardTitle>
            <Button onClick={() => setShowAddBudget(true)}>+ Agregar Presupuesto</Button>
          </div>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <p className="text-tb-shadow text-center py-8">
              No hay presupuestos configurados. Agrega uno para comenzar.
            </p>
          ) : (
            <div className="space-y-4">
              {budgets.map(budget => {
                const categoryExpenses = expenses.filter(e => e.category === budget.category && e.status === "approved");
                const categorySpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
                const percentage = budget.allocated_amount > 0 
                  ? (categorySpent / budget.allocated_amount) * 100 
                  : 0;

                return (
                  <div key={budget.id} className="border border-tb-line rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-tb-navy">{budget.category}</h3>
                      <Badge variant={percentage > 90 ? "error" : percentage > 70 ? "warning" : "info"}>
                        {percentage.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-tb-shadow mb-1">
                        <span>Gastado: ${categorySpent.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
                        <span>Asignado: ${budget.allocated_amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Form */}
      {showAddExpense && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-2">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-2">
                    Monto *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-navy mb-2">
                  Descripción *
                </label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creando..." : "Crear Gasto"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddExpense(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Expenses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gastos</CardTitle>
            <Button onClick={() => setShowAddExpense(true)}>+ Agregar Gasto</Button>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-tb-shadow text-center py-8">
              No hay gastos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-700">Fecha</th>
                    <th className="text-left p-3 font-medium text-gray-700">Categoría</th>
                    <th className="text-left p-3 font-medium text-gray-700">Descripción</th>
                    <th className="text-right p-3 font-medium text-gray-700">Monto</th>
                    <th className="text-center p-3 font-medium text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(expense.created_at).toLocaleDateString("es-ES")}
                      </td>
                      <td className="p-3">{expense.category}</td>
                      <td className="p-3">{expense.description}</td>
                      <td className="p-3 text-right font-semibold">
                        ${expense.amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            expense.status === "approved" ? "success" :
                            expense.status === "rejected" ? "error" : "warning"
                          }
                        >
                          {expense.status === "approved" ? "Aprobado" :
                           expense.status === "rejected" ? "Rechazado" : "Pendiente"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

