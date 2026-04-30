export function Logo() {
  return (
    <div className="flex flex-col items-center gap-1 w-fit mx-auto">
      <div className="flex items-end justify-between w-full">
        <img src="/logo.svg" alt="Logo" className="h-16 w-auto" />
        <h1 className="text-3xl font-bold">Lawfy</h1>
      </div>
      <p className="text-base opacity-70">Escritório Jurídico Digital</p>
    </div>
  );
}