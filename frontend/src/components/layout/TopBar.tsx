import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Painel de Controle',
  '/clientes': 'Clientes',
  '/processos': 'Processos',
  '/financeiro': 'Financeiro',
  '/perfil': 'Meu Perfil',
};

export function TopBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTitle = pageTitles[location.pathname] ?? 'Lawfy';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handlePerfil() {
    setIsOpen(false);
    navigate('/perfil');
  }

  function handleSignOut() {
    setIsOpen(false);
    signOut();
    navigate('/');
  }

  return (
    <header className="topbar-container">
      <h3 className="topbar-title">{pageTitle}</h3>

      <div className="relative" ref={dropdownRef}>
        <div
          className="user-badge cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="text-right">
            <p className="user-name">{user?.nome}</p>
            <span className="user-role">Advogada</span>
          </div>
          <div className="user-avatar">
            {user?.nome?.charAt(0)}
          </div>
        </div>

        {isOpen && (
          <div className="topbar-dropdown">
            <div className="topbar-dropdown-header">
              <p className="topbar-dropdown-name">{user?.nome}</p>
              <p className="topbar-dropdown-email">{user?.email}</p>
            </div>
            <div className="topbar-dropdown-divider" />
            <button
              className="topbar-dropdown-item"
              onClick={handlePerfil}
            >
              Meu Perfil
            </button>
            <div className="topbar-dropdown-divider" />
            <button
              className="topbar-dropdown-item topbar-dropdown-item-danger"
              onClick={handleSignOut}
            >
              Sair do Sistema
            </button>
          </div>
        )}
      </div>
    </header>
  );
}