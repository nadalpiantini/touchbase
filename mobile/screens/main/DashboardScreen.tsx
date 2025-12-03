import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { User } from '../../lib/types';

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('touchbase_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            full_name: profile.full_name,
            role: profile.role,
            organization_id: profile.organization_id,
          });
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.title}>Dashboard</Text>
        {user && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome, {user.full_name || user.email}!</Text>
            <Text style={styles.cardText}>Role: {user.role || 'N/A'}</Text>
          </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a3a5c',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
  },
});

