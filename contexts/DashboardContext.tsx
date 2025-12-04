'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type {
  DashboardState,
  DraftCompetition,
  DraftMatchday,
  DraftPlayer,
} from '@/lib/types';
import { generateId, generateSlug } from '@/lib/validators';

interface DashboardContextType {
  state: DashboardState | null;
  loading: boolean;
  error: string | null;
  refreshState: () => Promise<void>;
  
  // Competition actions
  addCompetition: (name: string) => Promise<DraftCompetition>;
  updateCompetition: (id: string, data: Partial<DraftCompetition>) => Promise<void>;
  deleteCompetition: (id: string) => Promise<void>;
  
  // Matchday actions
  addMatchday: (competitionId: string, matchdayNumber: number) => Promise<DraftMatchday>;
  updateMatchday: (id: string, data: Partial<DraftMatchday>) => Promise<void>;
  deleteMatchday: (id: string) => Promise<void>;
  
  // Player actions
  addPlayer: (matchdayId: string, player: Omit<DraftPlayer, 'id'>) => Promise<void>;
  updatePlayer: (matchdayId: string, playerId: string, data: Partial<DraftPlayer>) => Promise<void>;
  deletePlayer: (matchdayId: string, playerId: string) => Promise<void>;
  
  // Publish action
  publishMatchday: (matchdayId: string) => Promise<{ success: boolean; error?: string }>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const response = await fetch('/api/state');
      const result = await response.json();
      
      if (result.success) {
        setState(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch state');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveState = useCallback(async (newState: DashboardState) => {
    try {
      const response = await fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setState(result.data);
        return true;
      } else {
        setError(result.error || 'Failed to save state');
        return false;
      }
    } catch (err) {
      setError('Failed to save state');
      console.error('Error saving state:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Competition actions
  const addCompetition = useCallback(async (name: string): Promise<DraftCompetition> => {
    const now = new Date().toISOString();
    const competition: DraftCompetition = {
      id: generateId(),
      name,
      slug: generateSlug(name),
      createdAt: now,
      updatedAt: now,
    };

    const newState: DashboardState = {
      ...state!,
      competitions: [...state!.competitions, competition],
      lastUpdated: now,
    };

    await saveState(newState);
    return competition;
  }, [state, saveState]);

  const updateCompetition = useCallback(async (id: string, data: Partial<DraftCompetition>) => {
    const now = new Date().toISOString();
    const newState: DashboardState = {
      ...state!,
      competitions: state!.competitions.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: now } : c
      ),
      lastUpdated: now,
    };

    await saveState(newState);
  }, [state, saveState]);

  const deleteCompetition = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    const newState: DashboardState = {
      ...state!,
      competitions: state!.competitions.filter((c) => c.id !== id),
      matchdays: state!.matchdays.filter((m) => m.competitionId !== id),
      lastUpdated: now,
    };

    await saveState(newState);
  }, [state, saveState]);

  // Matchday actions
  const addMatchday = useCallback(async (competitionId: string, matchdayNumber: number): Promise<DraftMatchday> => {
    const now = new Date().toISOString();
    const matchday: DraftMatchday = {
      id: generateId(),
      competitionId,
      matchday: matchdayNumber,
      status: 'draft',
      players: [],
      createdAt: now,
      updatedAt: now,
    };

    const newState: DashboardState = {
      ...state!,
      matchdays: [...state!.matchdays, matchday],
      lastUpdated: now,
    };

    await saveState(newState);
    return matchday;
  }, [state, saveState]);

  const updateMatchday = useCallback(async (id: string, data: Partial<DraftMatchday>) => {
    const now = new Date().toISOString();
    const newState: DashboardState = {
      ...state!,
      matchdays: state!.matchdays.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: now } : m
      ),
      lastUpdated: now,
    };

    await saveState(newState);
  }, [state, saveState]);

  const deleteMatchday = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    const newState: DashboardState = {
      ...state!,
      matchdays: state!.matchdays.filter((m) => m.id !== id),
      lastUpdated: now,
    };

    await saveState(newState);
  }, [state, saveState]);

  // Player actions
  const addPlayer = useCallback(async (matchdayId: string, player: Omit<DraftPlayer, 'id'>) => {
    const now = new Date().toISOString();
    const newPlayer: DraftPlayer = {
      ...player,
      id: generateId(),
    };

    const newState: DashboardState = {
      ...state!,
      matchdays: state!.matchdays.map((m) =>
        m.id === matchdayId
          ? { ...m, players: [...m.players, newPlayer], updatedAt: now }
          : m
      ),
      lastUpdated: now,
    };

    await saveState(newState);
  }, [state, saveState]);

  const updatePlayer = useCallback(async (matchdayId: string, playerId: string, data: Partial<DraftPlayer>) => {
    const now = new Date().toISOString();
    const newState: DashboardState = {
      ...state!,
      matchdays: state!.matchdays.map((m) =>
        m.id === matchdayId
          ? {
              ...m,
              players: m.players.map((p) =>
                p.id === playerId ? { ...p, ...data } : p
              ),
              updatedAt: now,
            }
          : m
      ),
      lastUpdated: now,
    };

    await saveState(newState);
  }, [state, saveState]);

  const deletePlayer = useCallback(async (matchdayId: string, playerId: string) => {
    const now = new Date().toISOString();
    const newState: DashboardState = {
      ...state!,
      matchdays: state!.matchdays.map((m) =>
        m.id === matchdayId
          ? {
              ...m,
              players: m.players.filter((p) => p.id !== playerId),
              updatedAt: now,
            }
          : m
      ),
      lastUpdated: now,
    };

    await saveState(newState);
  }, [state, saveState]);

  // Publish action
  const publishMatchday = useCallback(async (matchdayId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchdayId }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh state after publishing
        await fetchState();
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to publish',
        };
      }
    } catch (err) {
      console.error('Error publishing:', err);
      return {
        success: false,
        error: 'Failed to connect to server',
      };
    }
  }, [fetchState]);

  const contextValue: DashboardContextType = {
    state,
    loading,
    error,
    refreshState: fetchState,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    addMatchday,
    updateMatchday,
    deleteMatchday,
    addPlayer,
    updatePlayer,
    deletePlayer,
    publishMatchday,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
