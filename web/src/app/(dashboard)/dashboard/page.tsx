"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, hydrateAuthFromStorage } from '../../../store/auth';
import api from '../../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  content: string;
  createdAt: string;
  assignments: Array<{
    id: string;
    status: 'PENDING' | 'COMPLETED' | 'SUBMITTED';
    student: {
      id: string;
      name: string;
    };
  }>;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const queryClient = useQueryClient();
  // Hydrate auth from storage on mount
  useEffect(() => {
    hydrateAuthFromStorage();
  }, []);
  // Redirect if not logged in or not a teacher
  useEffect(() => {
    if (!token) return;
    if (user && user.role !== 'DOCENTE') {
      router.push('/aluno');
    }
  }, [token, user, router]);

  const {
    data: activities,
    isLoading: loadingActivities,
    error: activitiesError,
  } = useQuery<Activity[]>(['teacherActivities'], async () => {
    const res = await api.get<Activity[]>('/activities/mine');
    return res.data;
  });

  const {
    data: students,
    isLoading: loadingStudents,
  } = useQuery<Student[]>(
    ['students'],
    async () => {
      const res = await api.get<Student[]>('/users/students');
      return res.data;
    },
    { enabled: !!user && user.role === 'DOCENTE' },
  );

  const createMutation = useMutation(
    async (data: { title: string; description?: string; content: string }) => {
      const res = await api.post('/activities', data);
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teacherActivities']);
      },
    },
  );

  const assignMutation = useMutation(
    async ({ activityId, studentIds }: { activityId: string; studentIds: string[] }) => {
      const res = await api.post(`/activities/${activityId}/assign`, { studentIds });
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teacherActivities']);
      },
    },
  );

  // Form state for creating activity
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newContent, setNewContent] = useState('');
  const [formError, setFormError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !newContent) {
      setFormError('Título e conteúdo são obrigatórios');
      return;
    }
    setFormError('');
    await createMutation.mutateAsync({ title: newTitle, description: newDescription, content: newContent });
    setShowCreate(false);
    setNewTitle('');
    setNewDescription('');
    setNewContent('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-gray-50 to-green-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg p-6 border-r border-gray-200">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-xl font-bold text-blue-700">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-lg">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.role === 'DOCENTE' ? 'Professor' : 'Usuário'}</div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-green-600 px-4 py-2 text-white font-medium shadow hover:bg-green-700 transition"
          >
            Nova atividade
          </button>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-white font-medium shadow hover:bg-red-700 transition mt-2"
          >
            Sair
          </button>
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
          <h1 className="text-2xl font-bold text-blue-700">Dashboard do Professor</h1>
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
          {/* Create Activity Modal */}
          {showCreate && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
              <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 relative animate-fadeIn">
                <button
                  onClick={() => setShowCreate(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
                  aria-label="Fechar"
                >
                  ×
                </button>
                <h2 className="text-xl font-bold mb-4 text-blue-700">Criar nova atividade</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  {formError && <p className="text-sm text-red-600">{formError}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição (opcional)</label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400"
                      rows={4}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createMutation.isLoading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {createMutation.isLoading ? 'Criando…' : 'Salvar atividade'}
                  </button>
                </form>
              </div>
            </div>
          )}
          {/* Activities Section */}
          <section>
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">Minhas atividades</h2>
            {loadingActivities ? (
              <div className="flex justify-center items-center h-32">
                <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></span>
                <span className="ml-3 text-blue-600">Carregando…</span>
              </div>
            ) : activitiesError ? (
              <p className="text-red-600">Erro ao carregar atividades</p>
            ) : activities && activities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => (
                  <div key={activity.id} className="rounded-xl bg-white shadow-lg p-6 hover:shadow-2xl transition border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-blue-700 mb-1">{activity.title}</h3>
                    {activity.description && <p className="text-sm text-gray-500 mb-2">{activity.description}</p>}
                    <p className="mb-2 whitespace-pre-line text-gray-700">{activity.content}</p>
                    <p className="text-xs text-gray-400 mb-2">Criado em {new Date(activity.createdAt).toLocaleDateString('pt-BR')}</p>
                    <div className="mt-auto">
                      <details className="mb-2">
                        <summary className="cursor-pointer text-blue-600 hover:underline font-medium">Atribuir aos alunos</summary>
                        <div className="mt-2">
                          {loadingStudents ? (
                            <p>Carregando lista de alunos…</p>
                          ) : students && students.length > 0 ? (
                            <AssignForm
                              activityId={activity.id}
                              students={students}
                              assign={assignMutation.mutateAsync}
                              disabled={assignMutation.isLoading}
                            />
                          ) : (
                            <p>Não há alunos disponíveis</p>
                          )}
                        </div>
                      </details>
                      {activity.assignments.length > 0 && (
                        <div className="mt-2">
                          <h4 className="font-medium text-gray-700">Atribuições</h4>
                          <ul className="mt-1 list-disc pl-5 text-sm text-gray-700">
                            {activity.assignments.map((assign) => (
                              <li key={assign.id}>
                                <span className="font-semibold text-blue-600">{assign.student.name}</span> – <span className={
                                  assign.status === 'COMPLETED' ? 'text-green-600' : assign.status === 'SUBMITTED' ? 'text-yellow-600' : 'text-gray-500'
                                }>{assign.status}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Você ainda não criou atividades.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

/**
 * Form to assign an activity to multiple students. Renders a list of
 * checkboxes and submits selected IDs to the API. A callback is
 * passed in from the page to perform the mutation.
 */
function AssignForm({
  activityId,
  students,
  assign,
  disabled,
}: {
  activityId: string;
  students: Student[];
  assign: (data: { activityId: string; studentIds: string[] }) => Promise<unknown>;
  disabled: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const handleToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      setMessage('Selecione pelo menos um aluno');
      return;
    }
    setMessage('');
    await assign({ activityId, studentIds: selected });
    setSelected([]);
    setMessage('Atividade atribuída!');
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="max-h-40 overflow-y-auto rounded border border-gray-200 p-2">
        {students.map((student) => (
          <label key={student.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selected.includes(student.id)}
              onChange={() => handleToggle(student.id)}
              className="rounded"
            />
            <span>{student.name}</span>
          </label>
        ))}
      </div>
      {message && <p className="text-sm text-green-700">{message}</p>}
      <button
        type="submit"
        disabled={disabled}
        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Atribuir selecionados
      </button>
    </form>
  );
}