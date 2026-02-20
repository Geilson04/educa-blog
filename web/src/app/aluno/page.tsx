"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, hydrateAuthFromStorage } from '../../store/auth';
import api from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Assignment {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'SUBMITTED';
  submission: string | null;
  activity: {
    id: string;
    title: string;
    description: string | null;
    content: string;
  };
}

export default function AlunoPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const queryClient = useQueryClient();
  useEffect(() => {
    hydrateAuthFromStorage();
  }, []);
  useEffect(() => {
    if (!token) return;
    if (user && user.role !== 'ALUNO') {
      router.push('/dashboard');
    }
  }, [token, user, router]);

  const {
    data: assignments,
    isLoading,
    error,
  } = useQuery<Assignment[]>(['studentActivities'], async () => {
    const res = await api.get<Assignment[]>('/activities/student');
    return res.data;
  });

  const submitMutation = useMutation(
    async ({ assignmentId, submission }: { assignmentId: string; submission: string }) => {
      const res = await api.post(`/activities/assignment/${assignmentId}/submit`, { submission });
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['studentActivities']);
      },
    },
  );

  const [submitting, setSubmitting] = useState<{ [key: string]: string }>({});
  const handleSubmit = async (assignmentId: string) => {
    const text = submitting[assignmentId];
    if (!text) return;
    await submitMutation.mutateAsync({ assignmentId, submission: text });
    setSubmitting((prev) => ({ ...prev, [assignmentId]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-green-50 via-gray-50 to-blue-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg p-6 border-r border-gray-200">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-xl font-bold text-green-700">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-lg">{user?.name}</div>
            <div className="text-xs text-gray-500">Aluno</div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-white font-medium shadow hover:bg-red-700 transition"
          >
            Sair
          </button>
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
          <h1 className="text-2xl font-bold text-green-700">Dashboard do Aluno</h1>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-gray-600">Bem-vindo, <span className="font-semibold">{user?.name}</span></span>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 transition"
            >
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-10">
          <section>
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">Minhas atividades</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></span>
                <span className="ml-3 text-green-600">Carregando…</span>
              </div>
            ) : error ? (
              <p className="text-red-600">Erro ao carregar atividades</p>
            ) : assignments && assignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-xl bg-white shadow-lg p-6 hover:shadow-2xl transition border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-green-700 mb-1">{assignment.activity.title}</h3>
                    {assignment.activity.description && (
                      <p className="text-sm text-gray-500 mb-2">{assignment.activity.description}</p>
                    )}
                    <p className="mb-2 whitespace-pre-line text-gray-700">{assignment.activity.content}</p>
                    <p className="text-sm mb-2">
                      Status:{' '}
                      <span className={
                        assignment.status === 'PENDING'
                          ? 'font-medium text-yellow-600'
                          : assignment.status === 'SUBMITTED'
                          ? 'font-medium text-blue-600'
                          : 'font-medium text-green-600'
                      }>
                        {assignment.status === 'PENDING'
                          ? 'Pendente'
                          : assignment.status === 'SUBMITTED'
                          ? 'Enviado'
                          : 'Concluído'}
                      </span>
                    </p>
                    {assignment.status === 'PENDING' && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={submitting[assignment.id] || ''}
                          onChange={(e) =>
                            setSubmitting((prev) => ({ ...prev, [assignment.id]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-green-400"
                          placeholder="Digite sua resposta aqui"
                          rows={3}
                        />
                        <button
                          onClick={() => handleSubmit(assignment.id)}
                          disabled={submitMutation.isLoading}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {submitMutation.isLoading ? 'Enviando…' : 'Enviar'}
                        </button>
                      </div>
                    )}
                    {assignment.status === 'SUBMITTED' && assignment.submission && (
                      <div className="mt-2 rounded-lg bg-gray-100 p-3 text-sm">
                        <p className="font-medium mb-1 text-gray-700">Sua resposta:</p>
                        <p>{assignment.submission}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Você não tem atividades atribuídas.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}