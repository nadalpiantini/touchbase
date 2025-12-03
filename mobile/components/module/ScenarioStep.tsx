import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { ScenarioStepData } from '../../lib/types/module';

interface ScenarioStepProps {
  data: ScenarioStepData;
  onChoice: (selectedIndex: number) => void;
  selectedChoice?: number;
}

export default function ScenarioStep({ data, onChoice, selectedChoice }: ScenarioStepProps) {
  const [localSelected, setLocalSelected] = useState<number | null>(selectedChoice ?? null);
  const [showConsequence, setShowConsequence] = useState(false);

  const handleSelect = (index: number) => {
    setLocalSelected(index);
    setShowConsequence(true);
    onChoice(index);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.prompt}>{data.prompt}</Text>
      
      <View style={styles.optionsContainer}>
        {data.options.map((option, index) => {
          const isSelected = localSelected === index;
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => handleSelect(index)}
              disabled={showConsequence}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showConsequence && localSelected !== null && (
        <View style={styles.consequenceContainer}>
          <Text style={styles.consequenceTitle}>Consequence:</Text>
          <Text style={styles.consequenceText}>
            {data.options[localSelected].consequence}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  prompt: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a3a5c',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedOption: {
    borderColor: '#1a3a5c',
    backgroundColor: '#f0f4f8',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  consequenceContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  consequenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a3a5c',
    marginBottom: 8,
  },
  consequenceText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

