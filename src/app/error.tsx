"use client";

export default function Error() {
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
      </div>
    </div>
  );
}
