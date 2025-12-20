'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Alert } from '@/components/ui';

interface ScheduleBuilderProps {
  classId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface ScheduleForm {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  start_date?: string;
  end_date?: string;
}

export function ScheduleBuilder({ classId, onSave, onCancel }: ScheduleBuilderProps) {
  const [schedules, setSchedules] = useState<ScheduleForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, [classId]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules/class/${classId}`);
      const json = await res.json();

      if (res.ok && json.schedules) {
        setSchedules(
          json.schedules.map((s: any) => ({
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            is_recurring: s.is_recurring ?? true,
            start_date: s.start_date,
            end_date: s.end_date,
          }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
        is_recurring: true,
      },
    ]);
  };

  const updateSchedule = (index: number, field: keyof ScheduleForm, value: any) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Save each schedule
      for (const schedule of schedules) {
        const res = await fetch(`/api/schedules/class/${classId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schedule),
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to save schedule');
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onSave) onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedules');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-tb-shadow">Loading schedules...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">Schedules saved successfully!</Alert>}

        <div className="space-y-4">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className="p-4 border border-tb-line rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-tb-navy">Schedule {index + 1}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSchedule(index)}
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-1">
                    Day of Week
                  </label>
                  <select
                    value={schedule.day_of_week}
                    onChange={(e) => updateSchedule(index, 'day_of_week', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-tb-line rounded-lg"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-1">
                    Recurring
                  </label>
                  <select
                    value={schedule.is_recurring ? 'true' : 'false'}
                    onChange={(e) => updateSchedule(index, 'is_recurring', e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-tb-line rounded-lg"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={schedule.start_time}
                    onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                    className="w-full px-3 py-2 border border-tb-line rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={schedule.end_time}
                    onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
                    className="w-full px-3 py-2 border border-tb-line rounded-lg"
                  />
                </div>

                {!schedule.is_recurring && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-tb-navy mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={schedule.start_date || ''}
                        onChange={(e) => updateSchedule(index, 'start_date', e.target.value)}
                        className="w-full px-3 py-2 border border-tb-line rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-tb-navy mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={schedule.end_date || ''}
                        onChange={(e) => updateSchedule(index, 'end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-tb-line rounded-lg"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={addSchedule}>
            + Add Schedule
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Schedules'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

