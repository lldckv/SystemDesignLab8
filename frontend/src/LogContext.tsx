import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

export interface LogEntry {
  id: number;
  time: string;
  operation: string;
  type: 'query' | 'mutation';
  variables?: unknown;
  result: 'ok' | 'error';
  detail: string;
}

interface LogContextValue {
  entries: LogEntry[];
  push: (entry: Omit<LogEntry, 'id' | 'time'>) => void;
  clear: () => void;
}

const LogContext = createContext<LogContextValue | null>(null);

export function LogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  const push = useCallback((entry: Omit<LogEntry, 'id' | 'time'>) => {
    setEntries((prev) => [
      {
        ...entry,
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString('ru-RU', { hour12: false }),
      },
      ...prev,
    ].slice(0, 30));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return <LogContext.Provider value={{ entries, push, clear }}>{children}</LogContext.Provider>;
}

export function useLog() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error('useLog must be used within LogProvider');
  return ctx;
}
