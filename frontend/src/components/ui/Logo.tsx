import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="flex flex-col items-center gap-1 w-fit mx-auto hover:opacity-80 transition-opacity">
      <div className="flex items-end gap-2 justify-center">
        <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
        <h1 className="text-2xl font-bold">Lawfy</h1>
      </div>
      <p className="text-sm opacity-70">Escritório Jurídico Digital</p>
    </Link>
  );
}