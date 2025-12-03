import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import { Module, ModuleStep, ModuleProgress } from '../../lib/types/module';
import { getModule, startModuleProgress, updateStepProgress } from '../../lib/services/modules';
import { loadModuleOffline, saveModuleOffline } from '../../lib/services/offline';
import ContentStep from '../../components/module/ContentStep';
import QuizStep from '../../components/module/QuizStep';
import ScenarioStep from '../../components/module/ScenarioStep';
import * as Network from 'expo-network';

type ModulePlayerScreenNavigationProp = NativeStackNavigationProp<MainTabParamList>;

interface RouteParams {
  moduleId: string;
}

export default function ModulePlayerScreen() {
  const route = useRoute();
  const navigation = useNavigation<ModulePlayerScreenNavigationProp>();
  const { moduleId } = (route.params as RouteParams) || {};

  const [module, setModule] = useState<Module | null>(null);
  const [steps, setSteps] = useState<ModuleStep[]>([]);
  const [progress, setProgress] = useState<ModuleProgress | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    setLoading(true);
    try {
      // Check network status
      const networkState = await Network.getNetworkStateAsync();
      setIsOffline(!networkState.isConnected);

      let moduleData;
      if (networkState.isConnected) {
        // Try online first
        moduleData = await getModule(moduleId);
        if (moduleData) {
          // Save for offline access
          await saveModuleOffline(moduleData.module, moduleData.steps);
        }
      }

      // Fallback to offline if online failed or offline mode
      if (!moduleData) {
        moduleData = await loadModuleOffline(moduleId);
      }

      if (!moduleData) {
        Alert.alert('Error', 'Module not found');
        navigation.goBack();
        return;
      }

      setModule(moduleData.module);
      setSteps(moduleData.steps);

      // Start progress if not already started
      if (networkState.isConnected) {
        try {
          await startModuleProgress(moduleId);
        } catch (error) {
          console.log('Progress already started or error:', error);
        }
      }
    } catch (error) {
      console.error('Error loading module:', error);
      Alert.alert('Error', 'Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async () => {
    if (!progress) return;

    const currentStep = steps[currentStepIndex];
    let stepData: any = { completed: true };

    // For quiz steps, include the answer and score
    if (currentStep.step_type === 'quiz') {
      const quizData = currentStep.content_data as any;
      const selectedAnswer = quizAnswers[currentStepIndex];
      const isCorrect = selectedAnswer === quizData?.correctIndex;
      const quizScore = isCorrect ? 100 : 0;

      stepData = {
        completed: true,
        quizScore,
        selectedAnswer,
        isCorrect,
      };
    }

    // For scenario steps, include the choice
    if (currentStep.step_type === 'scenario') {
      const selectedChoice = quizAnswers[currentStepIndex];
      stepData = {
        completed: true,
        scenarioChoice: selectedChoice,
      };
    }

    // Update progress (only if online)
    if (!isOffline) {
      try {
        await updateStepProgress(moduleId, currentStepIndex, stepData);
      } catch (error) {
        console.error('Error updating progress:', error);
        // Continue anyway - progress will sync when online
      }
    }

    // Reset quiz result state
    setShowQuizResult(false);

    // Move to next step
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Module completed
      Alert.alert('Congratulations!', 'You have completed this module!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleQuizAnswer = (stepIndex: number, answerIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [stepIndex]: answerIndex });
    setShowQuizResult(true);
  };

  const handleScenarioChoice = (stepIndex: number, choiceIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [stepIndex]: choiceIndex });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a3a5c" />
        <Text style={styles.loadingText}>Loading module...</Text>
      </View>
    );
  }

  if (!module || steps.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Module not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {module.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStepIndex + 1} of {steps.length}
        </Text>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content}>
        {currentStep.step_type === 'content' && (
          <ContentStep data={currentStep.content_data as any} />
        )}
        {currentStep.step_type === 'quiz' && (
          <QuizStep
            data={currentStep.content_data as any}
            onAnswer={(index) => handleQuizAnswer(currentStepIndex, index)}
            showResult={showQuizResult}
            selectedAnswer={quizAnswers[currentStepIndex]}
          />
        )}
        {currentStep.step_type === 'scenario' && (
          <ScenarioStep
            data={currentStep.content_data as any}
            onChoice={(index) => handleScenarioChoice(currentStepIndex, index)}
            selectedChoice={quizAnswers[currentStepIndex]}
          />
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentStepIndex === 0 && styles.navButtonDisabled]}
          onPress={() => {
            if (currentStepIndex > 0) {
              setCurrentStepIndex(currentStepIndex - 1);
              setShowQuizResult(false);
            }
          }}
          disabled={currentStepIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={handleStepComplete}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            {isLastStep ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  backButton: {
    fontSize: 16,
    color: '#1a3a5c',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a3a5c',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 60,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1a3a5c',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    gap: 12,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonPrimary: {
    backgroundColor: '#1a3a5c',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a3a5c',
  },
  navButtonTextPrimary: {
    color: '#fff',
  },
  offlineBanner: {
    backgroundColor: '#ffc107',
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
});

