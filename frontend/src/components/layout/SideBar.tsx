import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Scale, Wallet } from 'lucide-react';
import { Logo } from '../ui/Logo';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/processos', label: 'Processos', icon: Scale },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet },
];

export function SideBar() {
  return (
    <aside className="sidebar-container">
      <Logo />
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            <span className="w-5 flex justify-center shrink-0">
              <Icon size={18} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}