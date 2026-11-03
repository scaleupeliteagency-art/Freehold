import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useToastStore from './useToastStore';

export const XP_ECONOMY_CONFIG = {
  coreBadDayMinimum: 10,
  coreNormalTarget: 20,
  coreStretchTarget: 25,
  additionalInputCompleted: 5,
  dailyReviewCompleted: 5,
  weeklyReviewCompleted: 25,
  monthlyRockCompleted: 100,
  quarterlyObjectiveAchieved: 300,
};

export const RANKS = [
  { id: 'recruit', name: 'Recruit', levelMin: 1, levelMax: 5, minXp: 0, description: 'Establishing baseline execution patterns.' },
  { id: 'operator', name: 'Operator', levelMin: 6, levelMax: 15, minXp: 500, description: 'Consistent execution and reliable daily protocols.' },
  { id: 'elite', name: 'Elite', levelMin: 16, levelMax: 30, minXp: 2000, description: 'High operational rhythm and relentless standards.' },
  { id: 'veteran', name: 'Veteran', levelMin: 31, levelMax: 50, minXp: 5000, description: 'Battle-tested consistency over extended cycles.' },
  { id: 'master', name: 'Master', levelMin: 51, levelMax: 75, minXp: 10000, description: 'Exemplary focus architecture and zero tolerance for failure.' },
  { id: 'legend', name: 'Legend', levelMin: 76, levelMax: 100, minXp: 20000, description: 'Absolute mastery of the personal operating system.' },
];

export const INITIAL_SYSTEM_STATE = {
  currentStep: 1,

  // STEP 1 — IDENTITY & MISSION
  systemIdentity: {
    name: '',
    identityStatement: '',
    mission: '',
    why: '', // preserved for backward-compatibility
    principles: ['', '', ''], // 3 to 7 principles
    antiIdentity: '',
    personalStandards: '',
  },

  // STEP 2 — SYSTEM CONFIGURATION
  systemConfig: {
    startDate: new Date().toISOString().split('T')[0],
    expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    primaryDomain: 'Career & Business',
    description: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    preferredWeeklyReviewDay: 'Sunday',
    preferredDailyClosingTime: '21:00',
  },

  // STEP 3 — GOALS & SUCCESS CRITERIA
  goals: {
    systemSuccessOutcome: '',
    primary: {
      name: '',
      description: '',
      baseline: 0,
      target: 0,
      unit: '',
      deadline: '',
      weight: 100,
      direction: 'HIGHER',
      successCriteria: '',
    },
    secondary: {
      enabled: false,
      name: '',
      description: '',
      baseline: 0,
      target: 0,
      unit: '',
      deadline: '',
      weight: 0,
      direction: 'HIGHER',
      successCriteria: '',
    },
  },

  // STEP 4 — STRATEGIC ROADMAP
  roadmap: {
    year: new Date().getFullYear(),
    yearlyGoal: { name: '', description: '', expectedOutcome: '', measurement: '', target: 0 },
    quarter: Math.floor((new Date().getMonth() + 3) / 3),
    quarterlyObjective: { name: '', description: '', successCriteria: '', deadline: '', target: 0 },
    rocks: [
      {
        id: '1',
        name: '',
        description: '',
        desiredOutcome: '',
        target: 0,
        unit: '',
        weight: 33.33,
        deadline: '',
        successCriteria: '',
        milestones: [
          { name: 'Week 1 Foundation Milestone', description: '', week: 1 },
          { name: 'Week 2 Acceleration Milestone', description: '', week: 2 },
          { name: 'Week 3 Expansion Milestone', description: '', week: 3 },
          { name: 'Week 4 Consolidation Milestone', description: '', week: 4 },
        ],
      },
      {
        id: '2',
        name: '',
        description: '',
        desiredOutcome: '',
        target: 0,
        unit: '',
        weight: 33.33,
        deadline: '',
        successCriteria: '',
        milestones: [
          { name: 'Week 1 Foundation Milestone', description: '', week: 1 },
          { name: 'Week 2 Acceleration Milestone', description: '', week: 2 },
          { name: 'Week 3 Expansion Milestone', description: '', week: 3 },
          { name: 'Week 4 Consolidation Milestone', description: '', week: 4 },
        ],
      },
      {
        id: '3',
        name: '',
        description: '',
        desiredOutcome: '',
        target: 0,
        unit: '',
        weight: 33.34,
        deadline: '',
        successCriteria: '',
        milestones: [
          { name: 'Week 1 Foundation Milestone', description: '', week: 1 },
          { name: 'Week 2 Acceleration Milestone', description: '', week: 2 },
          { name: 'Week 3 Expansion Milestone', description: '', week: 3 },
          { name: 'Week 4 Consolidation Milestone', description: '', week: 4 },
        ],
      },
    ],
  },

  // STEP 5 — EXECUTION INPUTS
  inputs: [
    {
      id: 'core-input-1',
      name: '',
      description: '',
      measurementType: 'numeric',
      unit: '',
      minimumTarget: 1,
      normalTarget: 2,
      stretchTarget: 3,
      frequency: 'DAILY',
      rockIndex: 0,
      isCore: true,
    },
    {
      id: 'core-input-2',
      name: '',
      description: '',
      measurementType: 'numeric',
      unit: '',
      minimumTarget: 1,
      normalTarget: 2,
      stretchTarget: 3,
      frequency: 'DAILY',
      rockIndex: 1,
      isCore: true,
    },
    {
      id: 'core-input-3',
      name: '',
      description: '',
      measurementType: 'numeric',
      unit: '',
      minimumTarget: 1,
      normalTarget: 2,
      stretchTarget: 3,
      frequency: 'DAILY',
      rockIndex: 2,
      isCore: true,
    },
  ],

  // STEP 6 — NO-TO-DO LIST
  noTodoList: {
    rules: [
      {
        name: 'No social media or entertainment before core inputs',
        description: 'Do not consume reactive feeds until all 3 non-negotiables are completed.',
        reason: 'Conserves cognitive willpower for deep focus work.',
        situation: 'Morning & Deep Work Hours',
        violation: 'Opening Twitter, YouTube, Instagram or Reddit before 3 core inputs are checked.',
        recoveryAction: '10 minute screen timeout and immediate 25 minute focus block on Input 1.',
      },
    ],
    restrictedApps: ['Twitter / X', 'YouTube', 'Reddit', 'Instagram', 'TikTok'],
    restrictedWebsites: ['news.ycombinator.com', 'reddit.com', 'x.com', 'youtube.com'],
    distractionSources: 'Unscheduled messaging, unplanned tab browsing, background streaming',
    energyDrainingHabits: 'Late night screen usage, skipping morning routine',
    permittedAfterCommitments: 'Casual reading, leisure entertainment, social browsing after daily closing',
  },

  // STEP 7 — FOCUS ARCHITECTURE
  focusArchitecture: {
    focusTriggers: {
      location: 'Dedicated desk in quiet room',
      sound: 'Binaural beats or brown noise (no lyrics)',
      preWorkRoutine: 'Clear desk, fill water glass, review 3 core inputs',
      preparationRitual: '3 deep breaths, set timer for 50 minutes, activate do-not-disturb',
      physicalEnvironment: 'Natural light, cool temperature, clutter-free desk surface',
    },
    distractionControls: {
      notificationPolicy: 'Strict Do Not Disturb during work hours',
      phonePlacement: 'In separate room on silent',
      websiteRestrictions: 'Website blockers active during focus hours',
      messageCheckingWindows: '12:00 PM and 5:00 PM only',
      availabilityToOthers: 'Only reachable for true emergency calls',
    },
    focusSessions: {
      sessionDuration: 50,
      breakDuration: 10,
      maxDeepWorkSessionsPerDay: 4,
      preferredFocusHours: '08:00 - 12:00 and 14:00 - 16:30',
    },
  },

  // STEP 8 — PERFECT WEEK
  perfectWeek: {
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: '08:00 - 18:00',
    blocks: [
      { id: 'b1', title: 'Deep Work Block 1 (Core Focus)', day: 'Monday', startTime: '08:30', endTime: '11:00', category: 'Deep Work', description: 'Primary Core Inputs execution' },
      { id: 'b2', title: 'Priority Operational Execution', day: 'Monday', startTime: '11:30', endTime: '13:00', category: 'Priority Activity', description: 'Secondary core & project tasks' },
      { id: 'b3', title: 'Administrative & Comms Batch', day: 'Monday', startTime: '14:00', endTime: '15:00', category: 'Administrative', description: 'Emails, messages, scheduling' },
      { id: 'b4', title: 'Deep Work Block 2', day: 'Monday', startTime: '15:30', endTime: '17:30', category: 'Deep Work', description: 'High leverage projects' },
      { id: 'b5', title: 'Daily Review & Shutdown', day: 'Monday', startTime: '17:30', endTime: '18:00', category: 'Recovery / Review', description: 'Close day modal and log reflections' },
    ],
    priorityRules: {
      firstProductiveHours: 'Non-negotiable Core Input #1 gets the first 90 minutes of peak energy.',
      beforeAdmin: 'At least two core inputs must be 100% complete before opening inbox or slack.',
      batchingRule: 'Batch all administrative communications into a single 60-minute afternoon window.',
      protectedActivities: 'Deep work blocks are sacred: zero meetings, zero context switching.',
    },
  },

  // STEP 9 — ACCOUNTABILITY & PRESSURE
  accountability: {
    dailyClosingTime: '21:00',
    dailyReflectionQuestions: [
      'Did I fulfill all three non-negotiable core inputs today?',
      'What friction or distraction slowed down my execution?',
      'What single high-leverage improvement will I make tomorrow?',
    ],
    trackObstacles: true,
    trackFailureReasons: true,
    weeklyReviewDay: 'Sunday',
    weeklyReviewTime: '17:00',
    weeklyPerformanceObjective: 'Achieve at least 6 Normal Success days out of 7 with 100% Core Input completion.',
    weeklyReviewQuestions: [
      'Which Weekly Milestone moved forward?',
      'Did I honor my No-To-Do commitments?',
      'What needs to be eliminated or accelerated next week?',
    ],
    accountabilityPartner: '',
    commitmentStatement: 'I commit to executing my 3 core inputs daily and closing my ledger every evening without excuses.',
    safeConsequences: 'Donate $25 to a cause I support or 50 burpees next morning if I have an unexcused failed day.',
    recoveryAction: 'Start the day immediately with 45 minutes on Core Input #1 before any phone or email contact.',
  },

  // STEP 10 — GAMIFICATION CONFIGURATION
  gamification: {
    playerCallsign: 'Operator-One',
    avatar: 'shield', // 'shield' | 'flame' | 'target' | 'crown' | 'bolt' | 'swords'
    theme: 'tactical-dark', // 'tactical-dark' | 'clean-slate' | 'cyber-amber'
    characterDescription: 'A disciplined strategist relentlessly compound daily execution.',
    difficulty: 'STANDARD', // 'STANDARD' | 'HARD' | 'EXTREME'
    xpEconomy: { ...XP_ECONOMY_CONFIG },
  },
};

const useSystemCreationStore = create(
  persist(
    (set) => ({
      ...INITIAL_SYSTEM_STATE,

      // Actions
      setStep: (step) => set((state) => {
        if (step > state.currentStep) {
          useToastStore.getState().addToast("Draft saved locally.", "success", 1500);
        }
        return { currentStep: step };
      }),

      setIdentity: (identity) => set((state) => ({
        systemIdentity: {
          ...state.systemIdentity,
          ...identity,
          why: identity.mission || identity.why || state.systemIdentity.why,
        },
      })),

      setSystemConfig: (config) => set((state) => ({
        systemConfig: { ...state.systemConfig, ...config },
      })),

      setGoals: (goals) => set((state) => ({
        goals: { ...state.goals, ...goals },
      })),

      setRoadmap: (roadmap) => set((state) => ({
        roadmap: { ...state.roadmap, ...roadmap },
      })),

      setInputs: (inputs) => set({ inputs }),

      setNoTodoList: (noTodoList) => set((state) => ({
        noTodoList: { ...state.noTodoList, ...noTodoList },
      })),

      setFocusArchitecture: (focusArchitecture) => set((state) => ({
        focusArchitecture: { ...state.focusArchitecture, ...focusArchitecture },
      })),

      setPerfectWeek: (perfectWeek) => set((state) => ({
        perfectWeek: { ...state.perfectWeek, ...perfectWeek },
      })),

      setAccountability: (accountability) => set((state) => ({
        accountability: { ...state.accountability, ...accountability },
      })),

      setGamification: (gamification) => set((state) => ({
        gamification: { ...state.gamification, ...gamification },
      })),

      resetSystem: () => set({ ...INITIAL_SYSTEM_STATE }),
    }),
    {
      name: 'system-creation-storage',
    }
  )
);

export default useSystemCreationStore;
