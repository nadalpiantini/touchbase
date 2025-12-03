'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Alert } from '@/components/ui';
import { AttendanceStatus } from '@/lib/types/attendance';

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface AttendanceRecord {
  student_id: string;
  status: AttendanceStatus;
  notes?: string;
}

interface AttendanceMarkingProps {
  classId: string;
  students: Student[];
  date?: string;
  onSave?: () => void;
}

export function AttendanceMarking({ classId, students, date, onSave }: AttendanceMarkingProps) {
  const [selectedDate, setSelectedDate] = useState(date || new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [classId, selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/attendance/class/${classId}?date=${selectedDate}`);
      const json = await res.json();

      if (res.ok && json.attendance) {
        const existing: Record<string, AttendanceRecord> = {};
        json.attendance.forEach((a: any) => {
          existing[a.student_id] = {
            student_id: a.student_id,
            status: a.status,
            notes: a.notes,
          };
        });
        setRecords(existing);
      } else {
        // Initialize with empty records
        const empty: Record<string, AttendanceRecord> = {};
        students.forEach(s => {
          empty[s.id] = {
            student_id: s.id,
            status: 'present',
          };
        });
        setRecords(empty);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        status,
      },
    }));
  };

  const updateNotes = (studentId: string, notes: string) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        status: prev[studentId]?.status || 'present',
        notes,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const recordsArray = Object.values(records);
      const res = await fetch(`/api/attendance/class/${classId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          records: recordsArray,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to save attendance');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onSave) onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const statusColors: Record<AttendanceStatus, string> = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    excused: 'bg-blue-100 text-blue-800',
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-[--color-tb-shadow]">Loading attendance...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mark Attendance</CardTitle>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-[--color-tb-line] rounded-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">Attendance saved successfully!</Alert>}

        <div className="space-y-3">
          {students.map((student) => {
            const record = records[student.id] || { student_id: student.id, status: 'present' as AttendanceStatus };
            return (
              <div
                key={student.id}
                className="flex items-center gap-4 p-3 border border-[--color-tb-line] rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-[--color-tb-navy]">{student.full_name}</p>
                  <p className="text-sm text-[--color-tb-shadow]">{student.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(student.id, status)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        record.status === status
                          ? statusColors[status]
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={record.notes || ''}
                  onChange={(e) => updateNotes(student.id, e.target.value)}
                  className="px-3 py-1 border border-[--color-tb-line] rounded-lg text-sm w-32"
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

