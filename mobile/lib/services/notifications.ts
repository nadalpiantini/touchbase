import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPreferences {
  assignments: boolean;
  streaks: boolean;
  achievements: boolean;
  general: boolean;
}

export const defaultPreferences: NotificationPreferences = {
  assignments: true,
  streaks: true,
  achievements: true,
  general: true,
};

// Request permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return false;
  }

  return true;
}

// Get push token
export async function getPushToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

// Save push token to backend (to be implemented)
export async function savePushTokenToBackend(token: string, userId: string): Promise<void> {
  // TODO: Save token to Supabase or API
  // This would typically be done via an API endpoint
  console.log('Save push token to backend:', token, userId);
}

// Schedule assignment due date notification
export async function scheduleAssignmentNotification(
  assignmentId: string,
  title: string,
  dueDate: Date,
  hoursBefore: number = 24
): Promise<string | null> {
  try {
    const preferences = await getNotificationPreferences();
    if (!preferences.assignments) return null;

    const notificationDate = new Date(dueDate.getTime() - hoursBefore * 60 * 60 * 1000);
    const now = new Date();

    if (notificationDate <= now) {
      // Due date is too soon, schedule for 1 hour before
      const oneHourBefore = new Date(dueDate.getTime() - 60 * 60 * 1000);
      if (oneHourBefore <= now) {
        return null; // Too late to schedule
      }
      notificationDate.setTime(oneHourBefore.getTime());
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Assignment Due Soon',
        body: `${title} is due ${hoursBefore === 1 ? 'in 1 hour' : `in ${hoursBefore} hours`}`,
        data: {
          type: 'assignment',
          assignmentId,
        },
      },
      trigger: notificationDate,
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling assignment notification:', error);
    return null;
  }
}

// Schedule streak reminder notification
export async function scheduleStreakReminder(
  reminderTime: Date = new Date(new Date().setHours(20, 0, 0, 0)) // Default 8 PM
): Promise<string | null> {
  try {
    const preferences = await getNotificationPreferences();
    if (!preferences.streaks) return null;

    const now = new Date();
    if (reminderTime <= now) {
      // If reminder time has passed today, schedule for tomorrow
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Keep Your Streak Going!',
        body: "Don't forget to complete a module today to maintain your streak!",
        data: {
          type: 'streak',
        },
      },
      trigger: {
        hour: reminderTime.getHours(),
        minute: reminderTime.getMinutes(),
        repeats: true,
      },
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling streak reminder:', error);
    return null;
  }
}

// Cancel notification
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get notification preferences
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultPreferences;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return defaultPreferences;
  }
}

// Save notification preferences
export async function saveNotificationPreferences(
  preferences: NotificationPreferences
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      NOTIFICATION_PREFERENCES_KEY,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
}

// Show achievement notification
export async function showAchievementNotification(
  title: string,
  body: string,
  badgeId?: string
): Promise<void> {
  try {
    const preferences = await getNotificationPreferences();
    if (!preferences.achievements) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'achievement',
          badgeId,
        },
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error showing achievement notification:', error);
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

