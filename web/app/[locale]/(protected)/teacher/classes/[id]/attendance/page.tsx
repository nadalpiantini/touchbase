'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { supabaseClient } from '@/lib/supabase/client';

export default function AttendanceAnalyticsPage() {
  const params = useParams();
  const classId = params.id as string;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadStats();
  }, [classId, startDate, endDate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const supabase = supabaseClient!;
      
      let query = supabase
        .from("touchbase_attendance")
        .select("status")
        .eq("class_id", classId);

      if (startDate) {
        query = query.gte("attendance_date", startDate);
      }
      if (endDate) {
        query = query.lte("attendance_date", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const statsData = {
        total_days: 0,
        present_count: 0,
        absent_count: 0,
        late_count: 0,
        excused_count: 0,
        attendance_rate: 0,
      };

      if (data) {
        data.forEach((record: any) => {
          statsData.total_days++;
          if (record.status === "present") statsData.present_count++;
          else if (record.status === "absent") statsData.absent_count++;
          else if (record.status === "late") statsData.late_count++;
          else if (record.status === "excused") statsData.excused_count++;
        });

        statsData.attendance_rate =
          statsData.total_days > 0
            ? ((statsData.present_count + statsData.late_count + statsData.excused_count) / statsData.total_days) * 100
            : 0;
      }

      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[--color-tb-shadow]">Loading analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-[--color-tb-shadow]">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-2">
          Attendance Analytics
        </h1>
        <div className="flex items-center gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-[--color-tb-navy] mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-[--color-tb-line] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[--color-tb-navy] mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-[--color-tb-line] rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-[--color-tb-navy]">
              {stats.total_days}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-green-600">
              {stats.present_count}
            </p>
            <p className="text-sm text-[--color-tb-shadow] mt-1">
              {stats.total_days > 0
                ? Math.round((stats.present_count / stats.total_days) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-red-600">
              {stats.absent_count}
            </p>
            <p className="text-sm text-[--color-tb-shadow] mt-1">
              {stats.total_days > 0
                ? Math.round((stats.absent_count / stats.total_days) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-[--color-tb-red]">
              {Math.round(stats.attendance_rate)}%
            </p>
            <p className="text-sm text-[--color-tb-shadow] mt-1">
              Present + Late + Excused
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold text-yellow-600">
              {stats.late_count}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Excused</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold text-blue-600">
              {stats.excused_count}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

