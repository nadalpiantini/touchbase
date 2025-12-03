import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { QuizStepData } from '../../lib/types/module';

interface QuizStepProps {
  data: QuizStepData;
  onAnswer: (selectedIndex: number) => void;
  showResult?: boolean;
  selectedAnswer?: number;
}

export default function QuizStep({ data, onAnswer, showResult, selectedAnswer }: QuizStepProps) {
  const [localSelected, setLocalSelected] = useState<number | null>(selectedAnswer ?? null);

  const handleSelect = (index: number) => {
    if (showResult) return; // Don't allow changes after submission
    setLocalSelected(index);
    onAnswer(index);
  };

  const isCorrect = localSelected === data.correctIndex;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.question}>{data.question}</Text>
      
      <View style={styles.optionsContainer}>
        {data.options.map((option, index) => {
          const isSelected = localSelected === index;
          const isCorrectOption = index === data.correctIndex;
          
          let optionStyle = styles.option;
          if (showResult) {
            if (isCorrectOption) {
              optionStyle = [styles.option, styles.correctOption];
            } else if (isSelected && !isCorrectOption) {
              optionStyle = [styles.option, styles.incorrectOption];
            }
          } else if (isSelected) {
            optionStyle = [styles.option, styles.selectedOption];
          }

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleSelect(index)}
              disabled={showResult}
            >
              <Text style={styles.optionText}>{option}</Text>
              {showResult && isCorrectOption && (
                <Text style={styles.correctBadge}>✓ Correct</Text>
              )}
              {showResult && isSelected && !isCorrectOption && (
                <Text style={styles.incorrectBadge}>✗ Incorrect</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {showResult && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, isCorrect && styles.resultCorrect]}>
            {isCorrect ? 'Correct! Well done!' : 'Incorrect. Try again next time!'}
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
  question: {
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
  correctOption: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
  },
  incorrectOption: {
    borderColor: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  correctBadge: {
    marginTop: 8,
    color: '#28a745',
    fontWeight: '600',
  },
  incorrectBadge: {
    marginTop: 8,
    color: '#dc3545',
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#dc3545',
  },
  resultCorrect: {
    color: '#28a745',
  },
});

