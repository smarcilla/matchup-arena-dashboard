'use client';

import { useState } from 'react';

interface JsonPreviewProps {
  data: unknown;
  title?: string;
  onValidate?: () => Promise<{ valid: boolean; errors: string[] }>;
}

export function JsonPreview({ data, title, onValidate }: JsonPreviewProps) {
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);

  const handleValidate = async () => {
    if (!onValidate) return;
    
    setValidating(true);
    try {
      const result = await onValidate();
      setValidation(result);
    } catch (error) {
      setValidation({
        valid: false,
        errors: ['Validation failed: ' + String(error)],
      });
    } finally {
      setValidating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {title && (
        <div className="px-4 py-3 bg-zinc-800/50 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-medium text-white">{title}</h3>
          <div className="flex items-center gap-2">
            {onValidate && (
              <button
                onClick={handleValidate}
                disabled={validating}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition"
              >
                {validating ? 'Validating...' : 'Validate'}
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {validation && (
        <div
          className={`px-4 py-3 border-b border-zinc-800 ${
            validation.valid ? 'bg-green-900/20' : 'bg-red-900/20'
          }`}
        >
          {validation.valid ? (
            <p className="text-green-400 text-sm flex items-center gap-2">
              <span>✓</span> JSON is valid
            </p>
          ) : (
            <div>
              <p className="text-red-400 text-sm font-medium mb-2">
                ✗ Validation errors:
              </p>
              <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                {validation.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <pre className="p-4 overflow-auto max-h-96 text-sm">
        <code className="text-zinc-300">
          {JSON.stringify(data, null, 2)}
        </code>
      </pre>
    </div>
  );
}
