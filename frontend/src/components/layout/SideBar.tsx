import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../ui/Logo';

export function SideBar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar-container">
      <Logo />
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) =>
          isActive ? "nav-link nav-link-active" : "nav-link"
        }>
          Dashboard
        </NavLink>
        <NavLink to="/clientes" className={({ isActive }) =>
          isActive ? "nav-link nav-link-active" : "nav-link"
        }>
          Clientes
        </NavLink>
        <NavLink to="/processos" className={({ isActive }) =>
          isActive ? "nav-link nav-link-active" : "nav-link"
        }>
          Processos
        </NavLink>
        <NavLink to="/financeiro" className={({ isActive }) =>
          isActive ? "nav-link nav-link-active" : "nav-link"
        }>
          Financeiro
        </NavLink>
      </nav>
      <footer className="sidebar-footer">
        <button onClick={() => { signOut(); navigate('/'); }} className="btn-logout">
          Sair do Sistema
        </button>
      </footer>
    </aside>
  );
}