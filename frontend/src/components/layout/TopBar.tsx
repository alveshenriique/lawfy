import { useAuth } from '../../hooks/useAuth';

export function TopBar() {
  const { user } = useAuth();

  return (
    <header className="topbar-container">
      <h3 className="topbar-title">Painel de Controle</h3>
      <div className="user-badge">
        <div className="text-right">
          <p className="user-name">{user?.nome}</p>
          <span className="user-role">Advogado</span>
        </div>
        <div className="user-avatar">
          {user?.nome?.charAt(0)}
        </div>
      </div>
    </header>
  );
}