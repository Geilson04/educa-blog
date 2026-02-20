import './globals.css';
import type { ReactNode } from 'react';
import QueryProvider from '../providers/QueryProvider';

export const metadata = {
  title: 'educablog',
  description: 'Ferramenta para docentes e alunos da rede pública',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}