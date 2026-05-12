export function Logo() {
  return (
    <div className="flex flex-col items-center gap-1 w-fit mx-auto">
      <div className="flex items-end gap-2 justify-center">
        <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
        <h1 className="text-2xl font-bold">Lawfy</h1>
      </div>
      <p className="text-sm opacity-70">Escritório Jurídico Digital</p>
    </div>
  );
}