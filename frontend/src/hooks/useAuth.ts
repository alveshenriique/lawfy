import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';

import { AuthContext } from '../contexts/AuthContext';
import type { LoginFormData } from '../lib/validations/auth';

/**
 * Hook de Autenticação Profissional.
 * Centraliza: Lógica de Login, Navegação, Type Guards e Toasts.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  // Mover a lógica de navegação e erro para cá (conforme sua lista)
  async function handleSignIn(data: LoginFormData) {
    try {
      // O contexto faz a chamada à API e guarda o Token/User
      await context.signIn(data);
      
      toast.success("Bem-vindo ao Lawfy!");
      navigate('/dashboard');
    } catch (error) {
      // Type Guard seguro em vez de Assertion
      if (isAxiosError(error) && error.response) {
        const mensagem = error.response.data?.mensagem || "E-mail ou senha inválidos.";
        toast.error(mensagem);
      } else {
        toast.error("Não foi possível conectar ao servidor.");
      }
    }
  }

  return {
    ...context,
    handleSignIn,
  };
}