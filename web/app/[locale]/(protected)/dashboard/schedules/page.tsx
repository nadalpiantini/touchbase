"use client";

import { useState, useEffect, useMemo } from "react";
import CalendarView from "@/components/schedules/CalendarView";
import { schedulesToCalendarEvents, type CalendarEvent } from "@/lib/services/calendar";
import { Button, Card, CardContent } from "@/components/ui";

type ScheduleData = {
  id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone?: string;
  is_recurring: boolean;
  start_date?: string;
  end_date?: string;
  touchbase_classes?: {
    id: string;
    name: string;
    description?: string;
  };
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/schedules/list");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Error al cargar horarios");
      }

      setSchedules(json.schedules || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar events for current month view
  const calendarEvents = useMemo(() => {
    if (schedules.length === 0) return [];

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return schedulesToCalendarEvents(schedules, monthStart, monthEnd);
  }, [schedules]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.start));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-tb-navy] mb-4"></div>
          <p className="text-[--color-tb-shadow]">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">Error: {error}</p>
        <Button onClick={loadSchedules}>Reintentar</Button>
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--color-tb-navy]">Horarios</h1>
        <p className="text-[--color-tb-shadow] mt-1 font-sans">
          Visualiza y gestiona los horarios de clases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarView
            events={calendarEvents}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </div>

        <div className="space-y-4">
          {selectedDate && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-[--color-tb-navy] mb-2">
                  {selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <div className="space-y-2">
                  {calendarEvents
                    .filter(
                      (e) =>
                        e.start.getDate() === selectedDate.getDate() &&
                        e.start.getMonth() === selectedDate.getMonth() &&
                        e.start.getFullYear() === selectedDate.getFullYear()
                    )
                    .map((event) => (
                      <div
                        key={event.id}
                        className="p-2 border border-[--color-tb-line] rounded-lg cursor-pointer hover:bg-[--color-tb-bone]"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="font-medium text-sm text-[--color-tb-navy]">
                          {event.title}
                        </div>
                        <div className="text-xs text-[--color-tb-shadow]">
                          {event.start.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {event.end.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                  {calendarEvents.filter(
                    (e) =>
                      e.start.getDate() === selectedDate.getDate() &&
                      e.start.getMonth() === selectedDate.getMonth() &&
                      e.start.getFullYear() === selectedDate.getFullYear()
                  ).length === 0 && (
                    <p className="text-sm text-[--color-tb-shadow]">Sin eventos este día</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedEvent && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-[--color-tb-navy] mb-2">
                  Detalles del Evento
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Clase:</span> {selectedEvent.title}
                  </div>
                  <div>
                    <span className="font-medium">Hora:</span>{" "}
                    {selectedEvent.start.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {selectedEvent.end.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {selectedEvent.location && (
                    <div>
                      <span className="font-medium">Ubicación:</span> {selectedEvent.location}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedDate && !selectedEvent && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-[--color-tb-shadow] text-center">
                  Selecciona una fecha o evento para ver detalles
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
