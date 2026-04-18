import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AuthProvider } from '../utils/AuthContext';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="page-content">
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  );
}
