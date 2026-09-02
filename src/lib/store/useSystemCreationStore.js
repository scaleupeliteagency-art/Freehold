import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useToastStore from './useToastStore';

const useSystemCreationStore = create(
  persist(
    (set) => ({
      currentStep: 1,
      
      // Step 1: Identity
      systemIdentity: {
        name: '',
        why: '',
      },
      
      // Step 2: Goals
      goals: {
        primary: {
          name: '',
          description: '',
          baseline: 0,
          target: 0,
          unit: '',
          deadline: '',
          weight: 75,
          direction: 'HIGHER',
          successCriteria: ''
        },
        secondary: {
          enabled: false,
          name: '',
          description: '',
          baseline: 0,
          target: 0,
          unit: '',
          deadline: '',
          weight: 25,
          direction: 'HIGHER',
          successCriteria: ''
        }
      },
      
      // Step 3: Roadmap (Year -> Quarter -> Rocks -> Milestones)
      roadmap: {
        year: new Date().getFullYear(),
        yearlyGoal: { name: '', target: 0 },
        quarter: Math.floor((new Date().getMonth() + 3) / 3),
        quarterlyObjective: { name: '', target: 0 },
        rocks: [
          { id: '1', name: '', description: '', target: 0, unit: '', weight: 33.33, deadline: '', successCriteria: '', milestones: [] },
          { id: '2', name: '', description: '', target: 0, unit: '', weight: 33.33, deadline: '', successCriteria: '', milestones: [] },
          { id: '3', name: '', description: '', target: 0, unit: '', weight: 33.34, deadline: '', successCriteria: '', milestones: [] }
        ]
      },
      
      // Step 4: Daily Inputs (attached to milestones)
      inputs: [], // { id, milestoneId, name, minimum, normal, stretch, frequency }
      
      // Actions
      setStep: (step) => set((state) => {
        if (step > state.currentStep) {
          useToastStore.getState().addToast("Draft saved locally.", "success", 2000);
        }
        return { currentStep: step };
      }),
      setIdentity: (identity) => set({ systemIdentity: identity }),
      setGoals: (goals) => set({ goals }),
      setRoadmap: (roadmap) => set({ roadmap }),
      setInputs: (inputs) => set({ inputs }),
      
      resetSystem: () => set({
        currentStep: 1,
        systemIdentity: { name: '', why: '' },
        goals: {
          primary: { name: '', description: '', baseline: 0, target: 0, unit: '', deadline: '', weight: 75, direction: 'HIGHER', successCriteria: '' },
          secondary: { enabled: false, name: '', description: '', baseline: 0, target: 0, unit: '', deadline: '', weight: 25, direction: 'HIGHER', successCriteria: '' }
        },
        roadmap: {
          year: new Date().getFullYear(),
          yearlyGoal: { name: '', target: 0 },
          quarter: Math.floor((new Date().getMonth() + 3) / 3),
          quarterlyObjective: { name: '', target: 0 },
          rocks: [
            { id: '1', name: '', description: '', target: 0, unit: '', weight: 33.33, deadline: '', successCriteria: '', milestones: [] },
            { id: '2', name: '', description: '', target: 0, unit: '', weight: 33.33, deadline: '', successCriteria: '', milestones: [] },
            { id: '3', name: '', description: '', target: 0, unit: '', weight: 33.34, deadline: '', successCriteria: '', milestones: [] }
          ]
        },
        inputs: []
      })
    }),
    {
      name: 'system-creation-storage',
    }
  )
);

export default useSystemCreationStore;
