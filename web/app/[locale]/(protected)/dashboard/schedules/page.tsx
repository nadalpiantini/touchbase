"use client";

import { useState, useEffect } from "react";
import CalendarView from "@/components/schedules/CalendarView";
import { Card, CardContent, Button } from "@/components/ui";

type ScheduleEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "class" | "game" | "practice" | "event";
  location?: string;
};

export default function SchedulesPage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/schedules/list");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Convert database schedules to calendar events
      const eventsList: ScheduleEvent[] = [];
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      (data.schedules || []).forEach((schedule: any) => {
        const classData = schedule.touchbase_classes;
        if (!classData) return;

        // Generate events for the current month based on recurring schedule
        if (schedule.is_recurring) {
          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
          
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

            // Check if this day matches the schedule's day_of_week
            if (dayOfWeek === schedule.day_of_week) {
              const [hours, minutes] = schedule.start_time.split(':').map(Number);
              const start = new Date(date);
              start.setHours(hours, minutes, 0, 0);

              const [endHours, endMinutes] = schedule.end_time.split(':').map(Number);
              const end = new Date(date);
              end.setHours(endHours, endMinutes, 0, 0);

              // Check date range if specified
              if (schedule.start_date && new Date(schedule.start_date) > date) return;
              if (schedule.end_date && new Date(schedule.end_date) < date) return;

              eventsList.push({
                id: `${schedule.id}-${day}`,
                title: classData.name,
                start,
                end,
                type: "class",
              });
            }
          }
        }
      });

      setEvents(eventsList);
    } catch (error) {
      // Error loading schedules - will be handled by UI
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando horarios...</div>;
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--color-tb-navy]">Horarios y Calendario</h1>
        <p className="text-[--color-tb-shadow] mt-1">Gestiona clases, prácticas y eventos</p>
      </div>

      <div className="flex justify-end mb-4">
        <Button>+ Nuevo Evento</Button>
      </div>

      <CalendarView
        events={events}
        onDateClick={(date) => {
          // Handle date click - could open modal to add event
        }}
        onEventClick={(event) => {
          // Handle event click - could show event details
        }}
      />
    </main>
  );
}

