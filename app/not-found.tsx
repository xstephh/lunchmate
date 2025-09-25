export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border p-8 text-center">
      <h1 className="mb-2 text-lg font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist. Use the header to navigate.
      </p>
    </div>
  );
}
