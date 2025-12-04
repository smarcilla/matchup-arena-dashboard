'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/contexts/DashboardContext';
import { generateSlug } from '@/lib/validators';

export default function NewCompetitionPage() {
  const router = useRouter();
  const { addCompetition } = useDashboard();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [customSlug, setCustomSlug] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (value: string) => {
    setName(value);
    if (!customSlug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setSaving(true);
    try {
      const competition = await addCompetition(name.trim());
      router.push(`/dashboard/competitions/${competition.id}`);
    } catch (err) {
      setError('Failed to create competition');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">New Competition</h1>
        <p className="text-zinc-400">
          Create a new competition. You can add matchdays after creating it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Competition Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="e.g., La Liga, Premier League"
              required
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Slug
              <span className="text-zinc-500 font-normal ml-2">
                (used in file paths)
              </span>
            </label>
            <div className="flex gap-3">
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setCustomSlug(true);
                }}
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
                placeholder="la-liga"
                required
              />
              {customSlug && (
                <button
                  type="button"
                  onClick={() => {
                    setSlug(generateSlug(name));
                    setCustomSlug(false);
                  }}
                  className="px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition text-sm"
                >
                  Auto
                </button>
              )}
            </div>
            <p className="text-zinc-500 text-sm mt-2">
              Files will be stored at: <code className="text-zinc-400">competitions/{slug || 'slug'}/</code>
            </p>
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
            {saving ? 'Creating...' : 'Create Competition'}
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
    </div>
  );
}
