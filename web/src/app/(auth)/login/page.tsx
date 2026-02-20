"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/auth';
import { hydrateAuthFromStorage } from '../../../store/auth';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'DOCENTE' | 'ALUNO';
  };
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  // Hydrate state from local storage once on mount
  useState(() => {
    hydrateAuthFromStorage();
  });
  // Toggle between login and register forms
  const [registerMode, setRegisterMode] = useState(false);
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'DOCENTE' | 'ALUNO'>('DOCENTE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { token, user } = response.data;
      setAuth(token, user);
      // Redirect based on role
      if (user.role === 'DOCENTE') {
        router.push('/dashboard');
      } else {
        router.push('/aluno');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post<AuthResponse>('/auth/register', { name, email, password, role });
      const { token, user } = response.data;
      setAuth(token, user);
      if (user.role === 'DOCENTE') {
        router.push('/dashboard');
      } else {
        router.push('/aluno');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-semibold text-gray-800">
          {registerMode ? 'Criar conta' : 'Entrar'}
        </h1>
        {error && <p className="mb-3 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
        <form onSubmit={registerMode ? handleRegister : handleLogin} className="space-y-4">
          {registerMode && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Seu nome"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="seuemail@exemplo.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Sua senha"
              required
            />
          </div>
          {registerMode && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Papel
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'DOCENTE' | 'ALUNO')}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="DOCENTE">Docente</option>
                <option value="ALUNO">Aluno</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Aguarde…' : registerMode ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          {registerMode ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
          <button
            onClick={() => setRegisterMode(!registerMode)}
            className="font-medium text-blue-600 hover:underline"
            type="button"
          >
            {registerMode ? 'Entrar' : 'Criar conta'}
          </button>
        </div>
      </div>
    </div>
  );
}