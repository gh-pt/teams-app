"use client";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-cente px-4">
      <div className="max-w-md w-full text-center bg-[#1c1c1c] text-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-7xl font-bold">404</h1>

        <h2 className="mt-4 text-2xl font-semibold">Page not found</h2>

        <p className="mt-2 text-sm">
          Sorry, the page you are looking for doesn’t exist or has been moved.
        </p>
      </div>
    </div>
  );
}
