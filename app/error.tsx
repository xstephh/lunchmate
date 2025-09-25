"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border p-6">
          <h1 className="mb-2 text-lg font-semibold">Something went wrong</h1>
          <p className="mb-4 text-sm text-muted-foreground">{error.message}</p>
          <button
            onClick={() => reset()}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
