'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  LoadingPage,
  StatusBadge,
  ConfirmDialog,
  JsonPreview,
  ImageUpload,
} from '@/components';
import { draftToCompetitionFile, validateMatchdayForPublish } from '@/lib/validators';
import type { DraftPlayer } from '@/lib/types';

export default function MatchdayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchdayId = params.id as string;

  const {
    state,
    loading,
    error,
    updateMatchday,
    deleteMatchday,
    addPlayer,
    updatePlayer,
    deletePlayer,
    publishMatchday,
  } = useDashboard();

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [deletePlayerId, setDeletePlayerId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Player form state
  const [playerName, setPlayerName] = useState('');
  const [playerRanking, setPlayerRanking] = useState(1);
  const [playerImageUrl, setPlayerImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const matchday = state?.matchdays.find((m) => m.id === matchdayId);
  const competition = state?.competitions.find(
    (c) => c.id === matchday?.competitionId
  );

  useEffect(() => {
    if (matchday) {
      // Set next ranking number
      const maxRanking = Math.max(0, ...matchday.players.map((p) => p.ranking));
      setPlayerRanking(maxRanking + 1);
    }
  }, [matchday]);

  if (loading) {
    return <LoadingPage message="Loading matchday..." />;
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

  if (!matchday || !competition) {
    return (
      <div className="p-8">
        <div className="bg-yellow-900/50 border border-yellow-800 rounded-xl p-6">
          <h2 className="text-yellow-300 font-semibold mb-2">Not Found</h2>
          <p className="text-yellow-200">Matchday not found.</p>
          <Link
            href="/dashboard/matchdays"
            className="inline-block mt-4 text-blue-400 hover:text-blue-300"
          >
            ← Back to Matchdays
          </Link>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('competitionSlug', competition.slug);
      formData.append('matchday', String(matchday.matchday));
      formData.append('playerName', playerName || `player-${Date.now()}`);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPlayerImageUrl(result.data.url);
      } else {
        console.error('Upload failed:', result.error);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;

    const newPlayer: Omit<DraftPlayer, 'id'> = {
      name: playerName.trim(),
      ranking: playerRanking,
      image: playerImageUrl || '',
      imageUploaded: !!playerImageUrl,
    };

    await addPlayer(matchdayId, newPlayer);

    // Reset form
    setPlayerName('');
    setPlayerRanking(Math.max(...matchday.players.map((p) => p.ranking), 0) + 2);
    setPlayerImage(null);
    setPlayerImageUrl('');
    setShowAddPlayer(false);
  };

  const handleEditPlayer = (player: DraftPlayer) => {
    setEditingPlayerId(player.id);
    setPlayerName(player.name);
    setPlayerRanking(player.ranking);
    setPlayerImageUrl(player.image);
  };

  const handleUpdatePlayer = async () => {
    if (!editingPlayerId || !playerName.trim()) return;

    await updatePlayer(matchdayId, editingPlayerId, {
      name: playerName.trim(),
      ranking: playerRanking,
      image: playerImageUrl,
      imageUploaded: !!playerImageUrl,
    });

    setEditingPlayerId(null);
    setPlayerName('');
    setPlayerRanking(1);
    setPlayerImageUrl('');
  };

  const handleDeletePlayer = async () => {
    if (deletePlayerId) {
      await deletePlayer(matchdayId, deletePlayerId);
      setDeletePlayerId(null);
    }
  };

  const handleDeleteMatchday = async () => {
    await deleteMatchday(matchdayId);
    router.push('/dashboard/matchdays');
  };

  const handlePublish = async () => {
    setPublishError('');
    
    // Validate first
    const validation = validateMatchdayForPublish(matchday);
    if (!validation.valid) {
      setPublishError(validation.errors.join('. '));
      return;
    }

    setPublishing(true);
    try {
      const result = await publishMatchday(matchdayId);
      if (!result.success) {
        setPublishError(result.error || 'Failed to publish');
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleMarkReady = async () => {
    await updateMatchday(matchdayId, { status: 'ready' });
  };

  const previewData = draftToCompetitionFile(matchday, competition);
  const validationResult = validateMatchdayForPublish(matchday);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/dashboard/matchdays"
          className="text-zinc-400 hover:text-white text-sm mb-2 inline-block"
        >
          ← Back to Matchdays
        </Link>
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-white">
            {competition.name} - Matchday {matchday.matchday}
          </h1>
          <StatusBadge status={matchday.status} />
        </div>
        <p className="text-zinc-400">
          Manage players for this matchday. Add at least one player with an uploaded image to publish.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Players List */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Players ({matchday.players.length})
              </h2>
              <button
                onClick={() => {
                  setShowAddPlayer(true);
                  setEditingPlayerId(null);
                  setPlayerName('');
                  const maxRanking = Math.max(0, ...matchday.players.map((p) => p.ranking));
                  setPlayerRanking(maxRanking + 1);
                  setPlayerImageUrl('');
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition flex items-center gap-1"
              >
                <span>+</span>
                Add Player
              </button>
            </div>

            {/* Add/Edit Player Form */}
            {(showAddPlayer || editingPlayerId) && (
              <div className="p-6 bg-zinc-800/50 border-b border-zinc-800">
                <h3 className="text-white font-medium mb-4">
                  {editingPlayerId ? 'Edit Player' : 'Add New Player'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Player name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Ranking
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={playerRanking}
                        onChange={(e) => setPlayerRanking(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Image
                    </label>
                    <ImageUpload
                      onUpload={handleImageUpload}
                      currentImage={playerImageUrl}
                      disabled={uploadingImage}
                      className="w-full"
                    />
                    {uploadingImage && (
                      <p className="text-blue-400 text-sm mt-2">Uploading...</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={editingPlayerId ? handleUpdatePlayer : handleAddPlayer}
                    disabled={!playerName.trim() || uploadingImage}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition"
                  >
                    {editingPlayerId ? 'Update Player' : 'Add Player'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPlayer(false);
                      setEditingPlayerId(null);
                      setPlayerName('');
                      setPlayerRanking(1);
                      setPlayerImageUrl('');
                    }}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Players Table */}
            {matchday.players.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-4xl mb-4 block">👤</span>
                <p className="text-zinc-400">No players yet. Add your first player!</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {matchday.players
                  .sort((a, b) => a.ranking - b.ranking)
                  .map((player) => (
                    <div
                      key={player.id}
                      className="p-4 flex items-center justify-between hover:bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-zinc-500 w-8">
                          {player.ranking}
                        </span>
                        {player.image ? (
                          <div className="w-12 h-12 rounded-lg relative overflow-hidden">
                            <Image
                              src={player.image}
                              alt={player.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                            <span className="text-zinc-400">?</span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{player.name}</p>
                          <p className="text-zinc-400 text-sm">
                            {player.imageUploaded ? (
                              <span className="text-green-400">✓ Image uploaded</span>
                            ) : (
                              <span className="text-yellow-400">⚠ No image</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletePlayerId(player.id)}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Actions</h2>

            {matchday.status === 'draft' && (
              <button
                onClick={handleMarkReady}
                disabled={matchday.players.length === 0}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-400 text-white rounded-lg transition"
              >
                Mark as Ready
              </button>
            )}

            {matchday.status !== 'published' && (
              <button
                onClick={handlePublish}
                disabled={publishing || !validationResult.valid}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-400 text-white rounded-lg transition"
              >
                {publishing ? 'Publishing...' : '🚀 Publish to Blob'}
              </button>
            )}

            {publishError && (
              <p className="text-red-400 text-sm">{publishError}</p>
            )}

            {!validationResult.valid && (
              <div className="p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg">
                <p className="text-yellow-300 text-sm font-medium mb-1">
                  Cannot publish:
                </p>
                <ul className="text-yellow-200 text-sm list-disc list-inside">
                  {validationResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
            >
              {showPreview ? 'Hide Preview' : 'Show JSON Preview'}
            </button>

            <hr className="border-zinc-800" />

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg transition"
            >
              Delete Matchday
            </button>
          </div>

          {/* Info */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Info</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-400">Competition</dt>
                <dd className="text-white">{competition.name}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">Matchday</dt>
                <dd className="text-white">#{matchday.matchday}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">Players</dt>
                <dd className="text-white">{matchday.players.length}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">Created</dt>
                <dd className="text-white">
                  {new Date(matchday.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-400">Updated</dt>
                <dd className="text-white">
                  {new Date(matchday.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* JSON Preview */}
      {showPreview && (
        <div className="mt-8">
          <JsonPreview
            data={previewData}
            title="JSON Output Preview"
            onValidate={async () => {
              const response = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'competition', data: previewData }),
              });
              const result = await response.json();
              return result.data;
            }}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Matchday"
        message={`Are you sure you want to delete Matchday ${matchday.matchday}? All ${matchday.players.length} players will be removed.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteMatchday}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <ConfirmDialog
        isOpen={!!deletePlayerId}
        title="Delete Player"
        message="Are you sure you want to delete this player?"
        confirmLabel="Delete"
        onConfirm={handleDeletePlayer}
        onCancel={() => setDeletePlayerId(null)}
      />
    </div>
  );
}
