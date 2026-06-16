import { createContext, useContext, useMemo, useState } from 'react';

export type NamedRef = { id: string; name: string };

export type TestFlowMeta = {
  activeTab: string;
  subject: NamedRef | '';
  topics: NamedRef[];
  sub_topics: NamedRef[];
  total_marks: number;
  total_time: number;
  total_questions: number;
};

type TestFlowState = Record<string, TestFlowMeta>;

type TestFlowContextType = {
  getMeta: (testId: string | undefined) => TestFlowMeta | undefined;
  // 1. Made testId type consistent with the implementation (string only)
  setMeta: (testId: string, meta: TestFlowMeta) => void;
  clearMeta: (testId: string) => void;
};

const STORAGE_KEY = 'test_flow_meta';
const TestFlowContext = createContext<TestFlowContextType | null>(null);

const getInitialState = (): TestFlowState => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

export function TestFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TestFlowState>(getInitialState);

  const persist = (next: TestFlowState) => {
    setState(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo(
    () => ({
      getMeta: (testId: string | undefined) => {
        if (!testId) return undefined;
        return state[testId];
      },
      // 2. This now perfectly matches the type interface above
      setMeta: (testId: string, meta: TestFlowMeta) => {
        persist({ ...state, [testId]: meta });
      },
      clearMeta: (testId: string) => {
        const next = { ...state };
        delete next[testId];
        persist(next);
      },
    }),
    [state]
  );

  return <TestFlowContext.Provider value={value}>{children}</TestFlowContext.Provider>;
}

export function useTestFlow() {
  const ctx = useContext(TestFlowContext);
  if (!ctx) throw new Error('useTestFlow must be used inside TestFlowProvider');
  return ctx;
}
