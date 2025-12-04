'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDashboard } from '@/contexts/DashboardContext';
import { LoadingPage, StatusBadge, ConfirmDialog } from '@/components';

export default function CompetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;

  const {
    state,
    loading,
    error,
    updateCompetition,
    deleteCompetition,
    addMatchday,
    deleteMatchday,
  } = useDashboard();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMatchdayId, setDeleteMatchdayId] = useState<string | null>(null);
  const [showNewMatchday, setShowNewMatchday] = useState(false);
  const [newMatchdayNumber, setNewMatchdayNumber] = useState(1);

  const competition = state?.competitions.find((c) => c.id === competitionId);
  const matchdays = useMemo(() => 
    state?.matchdays
      .filter((m) => m.competitionId === competitionId)
      .sort((a, b) => b.matchday - a.matchday) || [],
    [state?.matchdays, competitionId]
  );

  useEffect(() => {
    if (competition) {
      setName(competition.name);
      setSlug(competition.slug);
      
      // Set next matchday number
      const maxMatchday = Math.max(0, ...matchdays.map((m) => m.matchday));
      setNewMatchdayNumber(maxMatchday + 1);
    }
  }, [competition, matchdays]);

  if (loading) {
    return <LoadingPage message="Loading competition..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900/50 border border-red-800 rounded-xl p-6">
          <h2 className="text-red-300 font-semibold mb-2">Error</h2>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="p-8">
        <div className="bg-yellow-900/50 border border-yellow-800 rounded-xl p-6">
          <h2 className="text-yellow-300 font-semibold mb-2">Not Found</h2>
          <p className="text-yellow-200">Competition not found.</p>
          <Link
            href="/dashboard/competitions"
            className="inline-block mt-4 text-blue-400 hover:text-blue-300"
          >
            ← Back to Competitions
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaveError('');

    if (!name.trim()) {
      setSaveError('Name is required');
      return;
    }

    if (!slug.trim() || !/^[a-z0-9-]+$/.test(slug)) {
      setSaveError('Slug must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    setSaving(true);
    try {
      await updateCompetition(competitionId, { name: name.trim(), slug });
    } catch (err) {
      setSaveError('Failed to save changes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteCompetition(competitionId);
    router.push('/dashboard/competitions');
  };

  const handleAddMatchday = async () => {
    try {
      const matchday = await addMatchday(competitionId, newMatchdayNumber);
      setShowNewMatchday(false);
      router.push(`/dashboard/matchdays/${matchday.id}`);
    } catch (err) {
      console.error('Failed to add matchday:', err);
    }
  };

  const handleDeleteMatchday = async () => {
    if (deleteMatchdayId) {
      await deleteMatchday(deleteMatchdayId);
      setDeleteMatchdayId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/dashboard/competitions"
          className="text-zinc-400 hover:text-white text-sm mb-2 inline-block"
        >
          ← Back to Competitions
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">{competition.name}</h1>
        <p className="text-zinc-400">
          Edit competition details and manage matchdays.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Edit Form */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Details</h2>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {saveError && (
              <p className="text-red-400 text-sm">{saveError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <hr className="border-zinc-800" />

            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-2">
                Danger Zone
              </h3>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg transition"
              >
                Delete Competition
              </button>
            </div>
          </div>
        </div>

        {/* Matchdays */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Matchdays</h2>
              <button
                onClick={() => setShowNewMatchday(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition flex items-center gap-1"
              >
                <span>+</span>
                Add Matchday
              </button>
            </div>

            {showNewMatchday && (
              <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 flex items-center gap-4">
                <label className="text-zinc-300 text-sm">Matchday #</label>
                <input
                  type="number"
                  min="1"
                  value={newMatchdayNumber}
                  onChange={(e) => setNewMatchdayNumber(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddMatchday}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewMatchday(false)}
                  className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            )}

            {matchdays.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-4xl mb-4 block">📅</span>
                <p className="text-zinc-400">No matchdays yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {matchdays.map((matchday) => (
                  <div
                    key={matchday.id}
                    className="p-4 flex items-center justify-between hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-zinc-500 w-12">
                        #{matchday.matchday}
                      </span>
                      <div>
                        <Link
                          href={`/matchdays/${matchday.id}`}
                          className="text-white font-medium hover:text-blue-400"
                        >
                          Matchday {matchday.matchday}
                        </Link>
                        <p className="text-zinc-400 text-sm">
                          {matchday.players.length} players
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={matchday.status} size="sm" />
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/matchdays/${matchday.id}`}
                          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteMatchdayId(matchday.id)}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Competition"
        message={`Are you sure you want to delete "${competition.name}"? This will also delete all ${matchdays.length} matchdays and their players.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <ConfirmDialog
        isOpen={!!deleteMatchdayId}
        title="Delete Matchday"
        message="Are you sure you want to delete this matchday? All players will be removed."
        confirmLabel="Delete"
        onConfirm={handleDeleteMatchday}
        onCancel={() => setDeleteMatchdayId(null)}
      />
    </div>
  );
}
