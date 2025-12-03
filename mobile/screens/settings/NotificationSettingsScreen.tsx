import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestNotificationPermissions,
  NotificationPreferences,
} from '../../lib/services/notifications';

export default function NotificationSettingsScreen() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    assignments: true,
    streaks: true,
    achievements: true,
    general: true,
  });
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkPermissions();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    await saveNotificationPreferences(newPreferences);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Notification Settings</Text>

        {!permissionGranted && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Notifications are disabled. Please enable them in your device settings.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Assignment Reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified when assignments are due soon
              </Text>
            </View>
            <Switch
              value={preferences.assignments}
              onValueChange={() => handleToggle('assignments')}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Streak Reminders</Text>
              <Text style={styles.settingDescription}>
                Daily reminders to maintain your learning streak
              </Text>
            </View>
            <Switch
              value={preferences.streaks}
              onValueChange={() => handleToggle('streaks')}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Achievements</Text>
              <Text style={styles.settingDescription}>
                Notifications when you earn badges or achievements
              </Text>
            </View>
            <Switch
              value={preferences.achievements}
              onValueChange={() => handleToggle('achievements')}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>General Notifications</Text>
              <Text style={styles.settingDescription}>
                Other important updates and announcements
              </Text>
            </View>
            <Switch
              value={preferences.general}
              onValueChange={() => handleToggle('general')}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginBottom: 24,
  },
  warning: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a3a5c',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
});

