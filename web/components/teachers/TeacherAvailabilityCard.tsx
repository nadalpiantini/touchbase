"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingSpinner,
  useToast,
  Input,
} from "@/components/ui";
import { usePermissions } from "@/lib/hooks/usePermissions";

interface TimeSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface TeacherAvailabilityCardProps {
  teacherId: string;
  onUpdate?: () => void;
}

export default function TeacherAvailabilityCard({
  teacherId,
  onUpdate,
}: TeacherAvailabilityCardProps) {
  const t = useTranslations("teachers.availability");
  const tCommon = useTranslations("common");
  const { addToast } = useToast();
  const { can } = usePermissions();

  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for adding time slot
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const canManage = can("UPDATE_CONTENT");

  const daysOfWeek = [
    t("days.sunday"),
    t("days.monday"),
    t("days.tuesday"),
    t("days.wednesday"),
    t("days.thursday"),
    t("days.friday"),
    t("days.saturday"),
  ];

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch(`/api/teachers/${teacherId}/availability`);
      if (!res.ok) throw new Error("Failed to fetch availability");

      const data = await res.json();
      setAvailability(data.data || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
      addToast(t("errors.fetchFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [teacherId, addToast, t]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleAddSlot = () => {
    if (startTime >= endTime) {
      addToast(t("errors.invalidTime"), "error");
      return;
    }

    const newSlot: TimeSlot = {
      day_of_week: selectedDay,
      start_time: startTime,
      end_time: endTime,
      is_available: true,
    };

    setAvailability([...availability, newSlot]);
  };

  const handleRemoveSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await fetch(`/api/teachers/${teacherId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || t("errors.saveFailed"));
      }

      addToast(t("success.saved"), "success");
      setIsEditing(false);
      await fetchAvailability();
      if (onUpdate) onUpdate();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : t("errors.saveFailed"),
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setIsEditing(false);
    await fetchAvailability();
  };

  const getSlotsByDay = (day: number) => {
    return availability
      .filter((slot) => slot.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <LoadingSpinner size="md" text={t("loading")} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-display text-tb-navy">
            {t("title")}
          </CardTitle>
          {canManage && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm">
              {tCommon("actions.edit")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekly Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {daysOfWeek.map((dayName, dayIndex) => {
            const slots = getSlotsByDay(dayIndex);
            return (
              <div
                key={dayIndex}
                className="border border-tb-line rounded-lg p-3"
              >
                <h4 className="font-medium text-tb-navy text-sm mb-2">
                  {dayName}
                </h4>
                <div className="space-y-2">
                  {slots.length === 0 ? (
                    <p className="text-xs text-tb-shadow italic">
                      {t("labels.noSlots")}
                    </p>
                  ) : (
                    slots.map((slot, slotIndex) => (
                      <div
                        key={slotIndex}
                        className="bg-tb-navy/5 rounded p-2 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-tb-navy">
                              {slot.start_time} - {slot.end_time}
                            </div>
                          </div>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                const index = availability.findIndex(
                                  (s) =>
                                    s.day_of_week === dayIndex &&
                                    s.start_time === slot.start_time &&
                                    s.end_time === slot.end_time
                                );
                                if (index >= 0) handleRemoveSlot(index);
                              }}
                              className="text-tb-stitch hover:text-tb-red text-xs"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Slot Form (Edit Mode) */}
        {isEditing && (
          <div className="mt-6 p-4 border border-tb-line rounded-lg bg-gray-50">
            <h4 className="font-medium text-tb-navy mb-3">
              {t("form.addSlot")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label
                  htmlFor="day"
                  className="block text-sm font-medium text-tb-navy mb-1"
                >
                  {t("form.day")}
                </label>
                <select
                  id="day"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-navy"
                >
                  {daysOfWeek.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="start_time"
                  className="block text-sm font-medium text-tb-navy mb-1"
                >
                  {t("form.startTime")}
                </label>
                <Input
                  id="start_time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="end_time"
                  className="block text-sm font-medium text-tb-navy mb-1"
                >
                  {t("form.endTime")}
                </label>
                <Input
                  id="end_time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddSlot} variant="secondary" className="w-full">
                  {t("form.add")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons (Edit Mode) */}
        {isEditing && (
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              {tCommon("actions.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={saving}
            >
              {saving ? t("form.saving") : tCommon("actions.save")}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isEditing && availability.length === 0 && (
          <div className="text-center py-8">
            <p className="text-tb-shadow mb-4">{t("empty")}</p>
            {canManage && (
              <Button onClick={() => setIsEditing(true)} variant="secondary">
                {t("actions.setSchedule")}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
