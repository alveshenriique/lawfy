export interface User {
  id: string;
  nome: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  usuario: User;
  mensagem: string;
}

export interface AuthContextData {
  user: User | null;
  signed: boolean;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => void;
  updateUser: (dadosAtualizados: Partial<User>) => void;
}