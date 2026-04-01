import { Routes as ReactRoutes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes'; 
import { Processos } from './pages/Processos'; 
import { Financeiro } from './pages/Financeiro';
import { PrivateRoute } from './components/auth/PrivateRoute';

export function Routes() {
  return (
    <ReactRoutes>
      <Route path="/" element={<Login />} />
      
      <Route path="/dashboard" element={
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
    </ReactRoutes>
  );
}