"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import type { CalendarEvent } from "@/lib/services/calendar";

type ScheduleEvent = CalendarEvent;

type CalendarViewProps = {
  events: ScheduleEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: ScheduleEvent) => void;
};

export default function CalendarView({ events, onDateClick, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const monthStart = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return date;
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return date;
  }, [currentDate]);

  const daysInMonth = monthEnd.getDate();
  const firstDayOfMonth = monthStart.getDay();

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-[--color-tb-navy] text-white";
      case "game":
        return "bg-[--color-tb-red] text-white";
      case "practice":
        return "bg-[--color-tb-stitch] text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-display">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(view === "month" ? "week" : "month")}
            >
              {view === "month" ? "Vista Semanal" : "Vista Mensual"}
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("prev")}
              >
                ‹
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("next")}
              >
                ›
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "month" ? (
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div
                key={day}
                className="p-2 text-center text-sm font-semibold text-[--color-tb-navy]"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before month start */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayEvents = getEventsForDate(date);
              const isToday =
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`aspect-square border border-[--color-tb-line] rounded-lg p-1 cursor-pointer hover:bg-[--color-tb-bone] transition ${
                    isToday ? "ring-2 ring-[--color-tb-red]" : ""
                  }`}
                  onClick={() => onDateClick?.(date)}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? "text-[--color-tb-red]" : "text-[--color-tb-navy]"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${getEventColor(event.type)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-[--color-tb-shadow]">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Week view - show current week */}
            {Array.from({ length: 7 }).map((_, idx) => {
              const date = new Date(currentDate);
              date.setDate(currentDate.getDate() - currentDate.getDay() + idx);
              const dayEvents = getEventsForDate(date);

              return (
                <div key={idx} className="border border-[--color-tb-line] rounded-lg p-4">
                  <div className="font-semibold text-[--color-tb-navy] mb-2">
                    {weekDays[date.getDay()]} {date.getDate()}
                  </div>
                  <div className="space-y-2">
                    {dayEvents.length === 0 ? (
                      <p className="text-sm text-[--color-tb-shadow]">Sin eventos</p>
                    ) : (
                      dayEvents.map(event => (
                        <div
                          key={event.id}
                          className={`p-2 rounded-lg ${getEventColor(event.type)} cursor-pointer hover:opacity-90`}
                          onClick={() => onEventClick?.(event)}
                        >
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-xs opacity-90">
                            {new Date(event.start).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {event.location && ` • ${event.location}`}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

