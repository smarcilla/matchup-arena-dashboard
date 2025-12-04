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
import {
  getDashboardState,
  createCompetition as createCompetitionAction,
  updateCompetition as updateCompetitionAction,
  deleteCompetition as deleteCompetitionAction,
  createMatchday as createMatchdayAction,
  updateMatchday as updateMatchdayAction,
  deleteMatchday as deleteMatchdayAction,
  createPlayer as createPlayerAction,
  updatePlayer as updatePlayerAction,
  deletePlayer as deletePlayerAction,
  publishMatchday as publishMatchdayAction,
} from '@/lib/actions';
import { generateSlug } from '@/lib/validators';

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
      setLoading(true);
      const data = await getDashboardState();
      setState(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch state');
      console.error('Error fetching state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Competition actions
  const addCompetition = useCallback(async (name: string): Promise<DraftCompetition> => {
    try {
      const slug = generateSlug(name);
      const competition = await createCompetitionAction({ name, slug });
      await fetchState();
      return {
        id: competition.id,
        name: competition.name,
        slug: competition.slug,
        createdAt: competition.createdAt.toISOString(),
        updatedAt: competition.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Error adding competition:', err);
      throw err;
    }
  }, [fetchState]);

  const updateCompetition = useCallback(async (id: string, data: Partial<DraftCompetition>) => {
    try {
      await updateCompetitionAction(id, {
        name: data.name,
        slug: data.slug,
      });
      await fetchState();
    } catch (err) {
      console.error('Error updating competition:', err);
      throw err;
    }
  }, [fetchState]);

  const deleteCompetitionFn = useCallback(async (id: string) => {
    try {
      await deleteCompetitionAction(id);
      await fetchState();
    } catch (err) {
      console.error('Error deleting competition:', err);
      throw err;
    }
  }, [fetchState]);

  // Matchday actions
  const addMatchday = useCallback(async (competitionId: string, matchdayNumber: number): Promise<DraftMatchday> => {
    try {
      const matchday = await createMatchdayAction({ competitionId, matchday: matchdayNumber });
      await fetchState();
      return {
        id: matchday.id,
        competitionId: matchday.competitionId,
        matchday: matchday.matchday,
        status: matchday.status as 'draft' | 'ready' | 'published',
        players: [],
        createdAt: matchday.createdAt.toISOString(),
        updatedAt: matchday.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Error adding matchday:', err);
      throw err;
    }
  }, [fetchState]);

  const updateMatchdayFn = useCallback(async (id: string, data: Partial<DraftMatchday>) => {
    try {
      await updateMatchdayAction(id, {
        status: data.status,
        matchday: data.matchday,
      });
      await fetchState();
    } catch (err) {
      console.error('Error updating matchday:', err);
      throw err;
    }
  }, [fetchState]);

  const deleteMatchdayFn = useCallback(async (id: string) => {
    try {
      await deleteMatchdayAction(id);
      await fetchState();
    } catch (err) {
      console.error('Error deleting matchday:', err);
      throw err;
    }
  }, [fetchState]);

  // Player actions
  const addPlayer = useCallback(async (matchdayId: string, player: Omit<DraftPlayer, 'id'>) => {
    try {
      await createPlayerAction({
        matchdayId,
        name: player.name,
        image: player.image,
        imageUploaded: player.imageUploaded,
        ranking: player.ranking,
      });
      await fetchState();
    } catch (err) {
      console.error('Error adding player:', err);
      throw err;
    }
  }, [fetchState]);

  const updatePlayerFn = useCallback(async (matchdayId: string, playerId: string, data: Partial<DraftPlayer>) => {
    try {
      await updatePlayerAction(playerId, {
        name: data.name,
        image: data.image,
        imageUploaded: data.imageUploaded,
        ranking: data.ranking,
      });
      await fetchState();
    } catch (err) {
      console.error('Error updating player:', err);
      throw err;
    }
  }, [fetchState]);

  const deletePlayerFn = useCallback(async (matchdayId: string, playerId: string) => {
    try {
      await deletePlayerAction(playerId);
      await fetchState();
    } catch (err) {
      console.error('Error deleting player:', err);
      throw err;
    }
  }, [fetchState]);

  // Publish action
  const publishMatchdayFn = useCallback(async (matchdayId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await publishMatchdayAction(matchdayId);
      if (result.success) {
        await fetchState();
      }
      return result;
    } catch (err) {
      console.error('Error publishing:', err);
      return {
        success: false,
        error: 'Failed to publish matchday',
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
    deleteCompetition: deleteCompetitionFn,
    addMatchday,
    updateMatchday: updateMatchdayFn,
    deleteMatchday: deleteMatchdayFn,
    addPlayer,
    updatePlayer: updatePlayerFn,
    deletePlayer: deletePlayerFn,
    publishMatchday: publishMatchdayFn,
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
