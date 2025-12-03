import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { Module } from '../../lib/types/module';
import { getModule } from '../../lib/services/modules';
import { loadModuleOffline, listOfflineModules } from '../../lib/services/offline';
import * as Network from 'expo-network';

export default function ModulesScreen() {
  const navigation = useNavigation<any>();
  const [modules, setModules] = useState<Module[]>([]);
  const [offlineModuleIds, setOfflineModuleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    try {
      // Load offline modules
      const offlineIds = await listOfflineModules();
      setOfflineModuleIds(offlineIds);

      // TODO: Load modules from API or Supabase
      // For now, we'll just show offline modules
      const offlineModules: Module[] = [];
      for (const moduleId of offlineIds) {
        const moduleData = await loadModuleOffline(moduleId);
        if (moduleData) {
          offlineModules.push(moduleData.module);
        }
      }
      setModules(offlineModules);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModulePress = (moduleId: string) => {
    navigation.navigate('ModulePlayer', { moduleId });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading modules...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Modules</Text>
        {modules.length === 0 ? (
          <Text style={styles.subtitle}>
            No modules available. Download modules to access them offline.
          </Text>
        ) : (
          <FlatList
            data={modules}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.moduleCard}
                onPress={() => handleModulePress(item.id)}
              >
                <Text style={styles.moduleTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.moduleDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.moduleMeta}>
                  <Text style={styles.moduleMetaText}>
                    {item.duration_minutes} min • {item.difficulty}
                  </Text>
                  {offlineModuleIds.includes(item.id) && (
                    <Text style={styles.offlineBadge}>Offline</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        )}
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a3a5c',
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  moduleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleMetaText: {
    fontSize: 12,
    color: '#999',
  },
  offlineBadge: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
});
