import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useReviewEngineStore = create(
  persist(
    (set, get) => ({
      currentStep: 1,
      reviewContext: null, // { id, type, periodStart, periodEnd }
      
      // Snapshots (loaded from DB or constructed on initiation)
      snapshots: {
        goals: [],
        inputs: [],
        milestones: [],
      },

      // Investigation Engine state
      investigation: {
        largestGap: null,
        bottleneck: null,
        hypotheses: [], // { id, text, confidence, evidence: [] }
      },

      // Decision Engine state
      decisions: {
        keep: [],
        stop: [],
        start: [],
        change: [],
      },
      
      // Actions
      initReview: (context, snapshots) => set({ 
        currentStep: 1, 
        reviewContext: context, 
        snapshots,
        investigation: { largestGap: null, bottleneck: null, hypotheses: [] },
        decisions: { keep: [], stop: [], start: [], change: [] }
      }),
      
      setStep: (step) => set({ currentStep: step }),
      
      setInvestigation: (investigation) => set({ investigation }),
      
      addHypothesis: (hypothesis) => set((state) => ({
        investigation: {
          ...state.investigation,
          hypotheses: [...state.investigation.hypotheses, hypothesis]
        }
      })),

      addDecision: (category, text) => set((state) => ({
        decisions: {
          ...state.decisions,
          [category]: [...state.decisions[category], { id: Date.now().toString(), text }]
        }
      })),
      
      removeDecision: (category, id) => set((state) => ({
        decisions: {
          ...state.decisions,
          [category]: state.decisions[category].filter(d => d.id !== id)
        }
      })),

      resetReview: () => set({
        currentStep: 1,
        reviewContext: null,
        snapshots: { goals: [], inputs: [], milestones: [] },
        investigation: { largestGap: null, bottleneck: null, hypotheses: [] },
        decisions: { keep: [], stop: [], start: [], change: [] }
      })
    }),
    {
      name: 'review-engine-storage',
    }
  )
);

export default useReviewEngineStore;
