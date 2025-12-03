'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { schedulesToCalendarEvents } from '@/lib/services/calendar';

interface WeeklyAgendaProps {
  classId?: string;
}

interface ScheduleData {
  id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  touchbase_classes?: {
    id: string;
    name: string;
  };
}

export function WeeklyAgenda({ classId }: WeeklyAgendaProps) {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    loadSchedules();
  }, [classId]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const url = classId
        ? `/api/schedules/class/${classId}`
        : '/api/schedules/list';
      const res = await fetch(url);
      const json = await res.json();

      if (res.ok) {
        setSchedules(json.schedules || []);
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const weekStart = useMemo(() => {
    const start = new Date(currentWeek);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [currentWeek]);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, [weekStart]);

  const weekEvents = useMemo(() => {
    if (schedules.length === 0) return [];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return schedulesToCalendarEvents(schedules, weekStart, weekEnd);
  }, [schedules, weekStart]);

  const getDayEvents = (date: Date) => {
    return weekEvents.filter(
      (e) =>
        e.start.getDate() === date.getDate() &&
        e.start.getMonth() === date.getMonth() &&
        e.start.getFullYear() === date.getFullYear()
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-[--color-tb-shadow]">Loading agenda...</p>
        </CardContent>
      </Card>
    );
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Agenda</CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="px-3 py-1 border border-[--color-tb-line] rounded-lg hover:bg-[--color-tb-bone]"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="px-3 py-1 border border-[--color-tb-line] rounded-lg hover:bg-[--color-tb-bone] text-sm"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="px-3 py-1 border border-[--color-tb-line] rounded-lg hover:bg-[--color-tb-bone]"
            >
              →
            </button>
          </div>
        </div>
        <p className="text-sm text-[--color-tb-shadow] mt-1">
          {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const dayEvents = getDayEvents(date);
            const isToday =
              date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`border border-[--color-tb-line] rounded-lg p-2 min-h-[120px] ${
                  isToday ? 'bg-[--color-tb-red]/5' : ''
                }`}
              >
                <div className="text-xs font-medium text-[--color-tb-navy] mb-1">
                  {dayNames[index]}
                </div>
                <div className="text-sm font-semibold text-[--color-tb-navy] mb-2">
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 bg-[--color-tb-red]/10 rounded border border-[--color-tb-red]/20"
                    >
                      <div className="font-medium text-[--color-tb-navy] truncate">
                        {event.title}
                      </div>
                      <div className="text-[--color-tb-shadow]">
                        {event.start.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

