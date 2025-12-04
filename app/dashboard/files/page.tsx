'use client';

import { useState, useEffect } from 'react';
import { LoadingPage } from '@/components';
import type { BlobFileInfo } from '@/lib/types';

export default function FilesPage() {
  const [files, setFiles] = useState<BlobFileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prefix, setPrefix] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchFiles = async (searchPrefix?: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchPrefix) params.set('prefix', searchPrefix);
      
      const response = await fetch(`/api/blob/files?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setFiles(result.data);
      } else {
        setError(result.error || 'Failed to fetch files');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(prefix);
  };

  const handleDelete = async (url: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    setDeleting(url);
    try {
      const response = await fetch('/api/blob/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFiles(files.filter((f) => f.url !== url));
      } else {
        alert(result.error || 'Failed to delete file');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (pathname: string): string => {
    if (pathname.endsWith('.json')) return '📄';
    if (pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return '🖼️';
    return '📁';
  };

  if (loading && files.length === 0) {
    return <LoadingPage message="Loading files from Blob storage..." />;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Blob Files</h1>
        <p className="text-zinc-400">
          Browse and manage files stored in Vercel Blob storage.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="Filter by prefix (e.g., competitions/)"
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setPrefix('');
              fetchFiles();
            }}
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <p className="text-zinc-400 text-sm">Total Files</p>
          <p className="text-2xl font-bold text-white">{files.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <p className="text-zinc-400 text-sm">JSON Files</p>
          <p className="text-2xl font-bold text-white">
            {files.filter((f) => f.pathname.endsWith('.json')).length}
          </p>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <p className="text-zinc-400 text-sm">Images</p>
          <p className="text-2xl font-bold text-white">
            {files.filter((f) => f.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length}
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <span className="text-6xl mb-4 block">📁</span>
          <h2 className="text-xl font-semibold text-white mb-2">
            No files found
          </h2>
          <p className="text-zinc-400">
            {prefix
              ? `No files match the prefix "${prefix}"`
              : 'Your Blob storage is empty. Publish a matchday to create files.'}
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                  File
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">
                  Size
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                  Uploaded
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {files.map((file) => (
                <tr key={file.url} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.pathname)}</span>
                      <div>
                        <p className="text-white font-mono text-sm">
                          {file.pathname}
                        </p>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          View raw ↗
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-300">
                    {formatBytes(file.size)}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(file.uploadedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(file.url)}
                      disabled={deleting === file.url}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 text-red-400 text-sm rounded-lg transition"
                    >
                      {deleting === file.url ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && files.length > 0 && (
        <div className="mt-4 text-center text-zinc-400">
          Loading...
        </div>
      )}
    </div>
  );
}
