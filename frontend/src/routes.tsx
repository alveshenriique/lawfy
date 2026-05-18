import { Routes as ReactRoutes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Perfil } from './pages/Perfil';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes'; 
import { Processos } from './pages/Processos'; 
import { Financeiro } from './pages/Financeiro';
import { NotFound } from './pages/NotFound';
import { PrivateRoute } from './components/auth/PrivateRoute';

export function Routes() {
  return (
    <ReactRoutes>
      <Route path="/login" element={<Login />} />

    <Route path="/perfil" element={
      <PrivateRoute><Perfil /></PrivateRoute>
      } />

      <Route path="/" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />

      <Route path="/clientes" element={
        <PrivateRoute><Clientes /></PrivateRoute>
      } />

      <Route path="/processos" element={
        <PrivateRoute><Processos /></PrivateRoute>
      } />

      <Route path="/financeiro" element={
        <PrivateRoute><Financeiro /></PrivateRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </ReactRoutes>
  );
}