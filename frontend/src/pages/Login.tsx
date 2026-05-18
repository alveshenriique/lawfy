import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { handleSignIn, loading, user } = useAuth();
  const navigate = useNavigate();

  // Proteção: Impede que usuários já autenticados acessem a página de Login
  useEffect(() => {
    if (user) {
      // replace: true remove a tela de login da pilha de histórico do navegador
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <AuthLayout>
      <LoginForm 
        onSubmit={handleSignIn} 
        isLoading={loading} 
      />
    </AuthLayout>
  );
}