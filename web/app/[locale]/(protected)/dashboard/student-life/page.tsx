"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, LoadingSpinner, Alert } from "@/components/ui";
import WellnessProgramForm from "@/components/student-life/WellnessProgramForm";

type WellnessProgram = {
  id: string;
  name: string;
  description?: string;
  program_type: string;
  start_date: string;
  end_date?: string;
};

type ExtracurricularActivity = {
  id: string;
  name: string;
  description?: string;
  activity_date: string;
  location?: string;
  max_participants?: number;
  participant_count?: number;
};

type PersonalDevelopmentLog = {
  id: string;
  log_type: string;
  title: string;
  content: string;
  logged_at: string;
};

export default function StudentLifePage() {
  const [wellnessPrograms, setWellnessPrograms] = useState<WellnessProgram[]>([]);
  const [activities, setActivities] = useState<ExtracurricularActivity[]>([]);
  const [logs, setLogs] = useState<PersonalDevelopmentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"wellness" | "activities" | "logs">("wellness");
  const [showWellnessForm, setShowWellnessForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/student-life?type=all");
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.error || "Error al cargar datos");
      }

      setWellnessPrograms(json.wellnessPrograms || []);
      setActivities(json.activities || []);
      setLogs(json.logs || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWellness = async (data: {
    name: string;
    description?: string;
    program_type: string;
    start_date: string;
    end_date?: string;
  }) => {
    const res = await fetch("/api/student-life", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "wellness", ...data }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || "Error al crear programa");
    }
    setShowWellnessForm(false);
    loadData();
  };

  if (loading) {
    return <LoadingSpinner text="Cargando datos de vida estudiantil..." />;
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
        <h1 className="text-2xl font-bold text-tb-navy">Vida Estudiantil</h1>
        <p className="text-tb-shadow mt-1">Programas de bienestar, actividades extracurriculares y desarrollo personal</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-tb-line">
        <button
          onClick={() => setActiveTab("wellness")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "wellness"
              ? "text-tb-red border-b-2 border-tb-red"
              : "text-tb-shadow hover:text-tb-navy"
          }`}
        >
          Bienestar
        </button>
        <button
          onClick={() => setActiveTab("activities")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "activities"
              ? "text-tb-red border-b-2 border-tb-red"
              : "text-tb-shadow hover:text-tb-navy"
          }`}
        >
          Actividades
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "logs"
              ? "text-tb-red border-b-2 border-tb-red"
              : "text-tb-shadow hover:text-tb-navy"
          }`}
        >
          Desarrollo Personal
        </button>
      </div>

      {/* Wellness Programs */}
      {activeTab === "wellness" && (
        <div>
          {showWellnessForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Nuevo Programa de Bienestar</CardTitle>
              </CardHeader>
              <CardContent>
                <WellnessProgramForm
                  onSubmit={handleCreateWellness}
                  onCancel={() => setShowWellnessForm(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={() => setShowWellnessForm(true)}>+ Nuevo Programa</Button>
              </div>
              {wellnessPrograms.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-tb-shadow">No hay programas de bienestar configurados.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wellnessPrograms.map(program => (
                    <Card key={program.id}>
                      <CardHeader>
                        <CardTitle>{program.name}</CardTitle>
                        <Badge variant="info">{program.program_type}</Badge>
                      </CardHeader>
                      <CardContent>
                        {program.description && (
                          <p className="text-sm text-tb-shadow mb-4">{program.description}</p>
                        )}
                        <div className="text-sm text-tb-shadow">
                          <p>Inicio: {new Date(program.start_date).toLocaleDateString("es-ES")}</p>
                          {program.end_date && (
                            <p>Fin: {new Date(program.end_date).toLocaleDateString("es-ES")}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Extracurricular Activities */}
      {activeTab === "activities" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button>+ Nueva Actividad</Button>
          </div>
          {activities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-tb-shadow">No hay actividades extracurriculares programadas.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map(activity => (
                <Card key={activity.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{activity.name}</CardTitle>
                      <Badge variant="info">
                        {activity.participant_count || 0} / {activity.max_participants || "∞"} participantes
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activity.description && (
                      <p className="text-sm text-tb-shadow mb-2">{activity.description}</p>
                    )}
                    <div className="text-sm text-tb-shadow">
                      <p>Fecha: {new Date(activity.activity_date).toLocaleDateString("es-ES")}</p>
                      {activity.location && <p>Ubicación: {activity.location}</p>}
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Personal Development Logs */}
      {activeTab === "logs" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button>+ Nuevo Log</Button>
          </div>
          {logs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-tb-shadow">No hay logs de desarrollo personal.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {logs.map(log => (
                <Card key={log.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{log.title}</CardTitle>
                      <Badge variant="info">{log.log_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-tb-shadow mb-2">{log.content}</p>
                    <div className="text-xs text-tb-shadow">
                      {new Date(log.logged_at).toLocaleDateString("es-ES")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

