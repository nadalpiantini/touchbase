"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, LoadingSpinner, Input, useToast } from "@/components/ui";

type PlacementTest = {
  id: string;
  name: string;
  description?: string;
  subject: string;
  passing_score: number;
  created_at: string;
};

type TestResult = {
  id: string;
  test_id: string;
  student_id: string;
  score: number;
  recommended_level: string;
  taken_at: string;
  touchbase_profiles?: {
    id: string;
    full_name?: string;
    email?: string;
  };
};

export default function PlacementTestsPage() {
  const { addToast } = useToast();
  const [tests, setTests] = useState<PlacementTest[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    passing_score: 70
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/placement-tests?includeResults=true");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Error al cargar pruebas");
      }

      setTests(json.tests || []);
      setResults(json.results || []);
    } catch {
      // Error handled by UI state
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    if (!formData.name.trim() || !formData.subject.trim()) {
      addToast("Por favor completa los campos requeridos", "warning");
      return;
    }

    try {
      const res = await fetch("/api/placement-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const json = await res.json();
        addToast(json.error || "Error al crear prueba", "error");
        return;
      }

      // Refresh data and close modal
      await loadData();
      addToast("Prueba de colocación creada exitosamente", "success");
      setShowCreateTest(false);
      setFormData({ name: "", description: "", subject: "", passing_score: 70 });
    } catch (error) {
      console.error("Error creating test:", error);
      addToast("Error al crear prueba", "error");
    }
  };

  const handleCloseModal = () => {
    setShowCreateTest(false);
    setFormData({ name: "", description: "", subject: "", passing_score: 70 });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando pruebas de colocación..." />
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-tb-navy">Pruebas de Colocación</h1>
        <p className="text-tb-shadow mt-1">Evalúa y asigna niveles académicos a estudiantes</p>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowCreateTest(true)}>+ Crear Prueba</Button>
      </div>

      {/* Tests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <p className="text-tb-shadow">
                No hay pruebas de colocación. Crea una para comenzar.
              </p>
            </CardContent>
          </Card>
        ) : (
          tests.map(test => (
            <Card key={test.id}>
              <CardHeader>
                <CardTitle className="text-lg">{test.name}</CardTitle>
                <Badge variant="info">{test.subject}</Badge>
              </CardHeader>
              <CardContent>
                {test.description && (
                  <p className="text-sm text-tb-shadow mb-4">{test.description}</p>
                )}
                <div className="text-sm text-tb-shadow mb-4">
                  Puntuación mínima: {test.passing_score}%
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Detalles
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Asignar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-700">Estudiante</th>
                    <th className="text-left p-3 font-medium text-gray-700">Prueba</th>
                    <th className="text-right p-3 font-medium text-gray-700">Puntuación</th>
                    <th className="text-left p-3 font-medium text-gray-700">Nivel Recomendado</th>
                    <th className="text-left p-3 font-medium text-gray-700">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {result.touchbase_profiles?.full_name || result.touchbase_profiles?.email || `Estudiante ${result.student_id.slice(0, 8)}`}
                      </td>
                      <td className="p-3">
                        {tests.find(t => t.id === result.test_id)?.name || `Prueba ${result.test_id.slice(0, 8)}`}
                      </td>
                      <td className="p-3 text-right font-semibold">{result.score}%</td>
                      <td className="p-3">
                        <Badge variant="success">{result.recommended_level || "N/A"}</Badge>
                      </td>
                      <td className="p-3">
                        {new Date(result.taken_at).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Test Modal */}
      {showCreateTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Crear Nueva Prueba de Colocación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-1">
                    Nombre de la Prueba <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Matemáticas Nivel Inicial"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción de la prueba..."
                    className="w-full px-4 py-2 border border-tb-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tb-rust min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-1">
                    Materia/Tema <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ej: Matemáticas, Inglés, Ciencias"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-1">
                    Puntuación Mínima (%) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-tb-shadow mt-1">
                    Porcentaje mínimo requerido para aprobar (0-100)
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-tb-line">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreateTest}
                    disabled={!formData.name.trim() || !formData.subject.trim()}
                  >
                    Crear Prueba
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}

