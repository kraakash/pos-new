import { create } from 'zustand';

/**
 * Zustand store to manage AI Mock Interview session configurations and round progress states.
 */
export const useInterviewStore = create((set) => ({
  role: null,
  type: null,
  difficulty: 'MEDIUM',
  sessionId: null,
  question: null,
  questionNumber: 0,
  currentDifficulty: 'MEDIUM',
  feedback: null,
  report: null,

  /**
   * Sets up initial candidate target values before starting a mock round.
   */
  setSetup: (payload) => set((state) => ({ ...state, ...payload })),

  /**
   * Initializes state parameters for a newly spawned interview session.
   */
  startSession: ({ sessionId, question, questionNumber, difficulty }) =>
    set({
      sessionId,
      question,
      questionNumber,
      currentDifficulty: difficulty,
      feedback: null,
      report: null
    }),

  /**
   * Updates mock round details after a turn evaluation finishes.
   */
  updateTurn: ({ question, questionNumber, difficulty, feedback }) =>
    set({
      question,
      questionNumber,
      currentDifficulty: difficulty,
      feedback: feedback || null
    }),

  /**
   * Sets the final score report detail object at the end of the round.
   */
  setReport: (report) => set({ report }),

  /**
   * Resets the entire store back to setup configuration values.
   */
  reset: () =>
    set({
      role: null,
      type: null,
      difficulty: 'MEDIUM',
      sessionId: null,
      question: null,
      questionNumber: 0,
      currentDifficulty: 'MEDIUM',
      feedback: null,
      report: null
    })
}));
