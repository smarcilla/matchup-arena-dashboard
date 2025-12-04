'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/contexts/DashboardContext';
import { LoadingPage } from '@/components';

export default function NewMatchdayPage() {
  const router = useRouter();
  const { state, loading, addMatchday } = useDashboard();
  const [competitionId, setCompetitionId] = useState('');
  const [matchdayNumber, setMatchdayNumber] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return <LoadingPage message="Loading..." />;
  }

  const competitions = state?.competitions || [];

  const handleCompetitionChange = (id: string) => {
    setCompetitionId(id);
    // Set next matchday number for this competition
    const competitionMatchdays = state?.matchdays.filter(
      (m) => m.competitionId === id
    ) || [];
    const maxMatchday = Math.max(0, ...competitionMatchdays.map((m) => m.matchday));
    setMatchdayNumber(maxMatchday + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!competitionId) {
      setError('Please select a competition');
      return;
    }

    if (matchdayNumber < 1) {
      setError('Matchday number must be at least 1');
      return;
    }

    // Check if matchday already exists
    const existingMatchday = state?.matchdays.find(
      (m) => m.competitionId === competitionId && m.matchday === matchdayNumber
    );
    if (existingMatchday) {
      setError(`Matchday ${matchdayNumber} already exists for this competition`);
      return;
    }

    setSaving(true);
    try {
      const matchday = await addMatchday(competitionId, matchdayNumber);
      router.push(`/dashboard/matchdays/${matchday.id}`);
    } catch (err) {
      setError('Failed to create matchday');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">New Matchday</h1>
        <p className="text-zinc-400">
          Create a new matchday for a competition. You can add players after creating it.
        </p>
      </div>

      {competitions.length === 0 ? (
        <div className="bg-yellow-900/50 border border-yellow-800 rounded-xl p-6">
          <h2 className="text-yellow-300 font-semibold mb-2">No Competitions</h2>
          <p className="text-yellow-200">
            You need to create a competition first before adding matchdays.
          </p>
          <button
            onClick={() => router.push('/dashboard/competitions/new')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Create Competition
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
            <div>
              <label
                htmlFor="competition"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Competition
              </label>
              <select
                id="competition"
                value={competitionId}
                onChange={(e) => handleCompetitionChange(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              >
                <option value="">Select a competition...</option>
                {competitions.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="matchday"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Matchday Number
              </label>
              <input
                id="matchday"
                type="number"
                min="1"
                value={matchdayNumber}
                onChange={(e) => setMatchdayNumber(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
              {competitionId && (
                <p className="text-zinc-500 text-sm mt-2">
                  Existing matchdays:{' '}
                  {state?.matchdays
                    .filter((m) => m.competitionId === competitionId)
                    .map((m) => `#${m.matchday}`)
                    .join(', ') || 'None'}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
            >
              {saving ? 'Creating...' : 'Create Matchday'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
