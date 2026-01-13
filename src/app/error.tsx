"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1c1c1c] text-white shadow-lg rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-3xl">!</span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-white">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-white">
          An unexpected error occurred. Please try again or come back later.
        </p>

        {/* Optional error digest (useful for debugging) */}
        {error.digest && (
          <p className="mt-4 text-xs text-gray-400">
            Error ID: <span className="font-mono">{error.digest}</span>
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex justify-center items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:cursor-pointer transition"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
