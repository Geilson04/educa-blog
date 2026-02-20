import { redirect } from 'next/navigation';

/**
 * Root route of the application. Immediately redirects the user to
 * the login page. This prevents duplicate routes for the root path.
 */
export default function Home() {
  redirect('/login');
}