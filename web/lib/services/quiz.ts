// ============================================================
// TouchBase Academy - Quiz Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";

export type QuizAnswer = {
  questionIndex: number;
  selectedOption: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
};

export type QuizResult = {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  answers: QuizAnswer[];
};

/**
 * Check quiz answers and calculate score
 */
export function checkQuizAnswers(
  questions: Array<{ options: string[]; correctAnswer: number }>,
  answers: Array<{ questionIndex: number; selectedOption: number }>
): QuizResult {
  const quizAnswers: QuizAnswer[] = [];
  let correctCount = 0;

  questions.forEach((question, index) => {
    const answer = answers.find((a) => a.questionIndex === index);
    const isCorrect = answer?.selectedOption === question.correctAnswer;

    if (isCorrect) {
      correctCount++;
    }

    quizAnswers.push({
      questionIndex: index,
      selectedOption: answer?.selectedOption ?? -1,
      isCorrect,
      timeSpentSeconds: 0, // Would be tracked separately
    });
  });

  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return {
    totalQuestions: questions.length,
    correctAnswers: correctCount,
    score,
    answers: quizAnswers,
  };
}

