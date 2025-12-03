/**
 * Calendar service - transforms schedule data to calendar events
 */

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "class" | "game" | "practice" | "event";
  location?: string;
  classId?: string;
  className?: string;
};

export type ScheduleData = {
  id: string;
  class_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
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

/**
 * Convert schedule data to calendar events for a given date range
 */
export function schedulesToCalendarEvents(
  schedules: ScheduleData[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const schedule of schedules) {
    const scheduleStart = new Date(startDate);
    const scheduleEnd = new Date(endDate);

    // Generate events for each occurrence in the date range
    let currentDate = new Date(scheduleStart);
    
    while (currentDate <= scheduleEnd) {
      // Check if this date matches the day of week
      if (currentDate.getDay() === schedule.day_of_week) {
        // Check if within recurring date range
        if (schedule.is_recurring) {
          if (schedule.start_date && new Date(schedule.start_date) > currentDate) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
          }
          if (schedule.end_date && new Date(schedule.end_date) < currentDate) {
            break;
          }
        }

        // Parse time strings (HH:MM:SS or HH:MM)
        const [startHours, startMinutes] = schedule.start_time.split(':').map(Number);
        const [endHours, endMinutes] = schedule.end_time.split(':').map(Number);

        const eventStart = new Date(currentDate);
        eventStart.setHours(startHours, startMinutes, 0, 0);

        const eventEnd = new Date(currentDate);
        eventEnd.setHours(endHours, endMinutes, 0, 0);

        events.push({
          id: `${schedule.id}-${currentDate.toISOString().split('T')[0]}`,
          title: schedule.touchbase_classes?.name || "Clase",
          start: eventStart,
          end: eventEnd,
          type: "class",
          classId: schedule.class_id,
          className: schedule.touchbase_classes?.name,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Get events for a specific date
 */
export function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter(event => {
    const eventDate = new Date(event.start);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });
}

