import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Video, Audio } from 'expo-av';
import { useState, useEffect } from 'react';
import { ContentStepData } from '../../lib/types/module';

interface ContentStepProps {
  data: ContentStepData;
}

export default function ContentStep({ data }: ContentStepProps) {
  const [videoRef, setVideoRef] = useState<Video | null>(null);
  const [audioRef, setAudioRef] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.unloadAsync();
      }
    };
  }, [audioRef]);

  const renderMedia = () => {
    if (!data.mediaUrl) return null;

    switch (data.mediaType) {
      case 'image':
        return (
          <Image
            source={{ uri: data.mediaUrl }}
            style={styles.media}
            resizeMode="contain"
          />
        );
      case 'video':
        return (
          <Video
            ref={setVideoRef}
            source={{ uri: data.mediaUrl }}
            style={styles.media}
            useNativeControls
            resizeMode="contain"
          />
        );
      case 'audio':
        return (
          <View style={styles.audioContainer}>
            <Text style={styles.audioLabel}>Audio Content</Text>
            {/* Audio player would be implemented here */}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {data.text && (
        <Text style={styles.text}>{data.text}</Text>
      )}
      {renderMedia()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  media: {
    width: '100%',
    height: 300,
    marginBottom: 16,
  },
  audioContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  audioLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a3a5c',
  },
});

