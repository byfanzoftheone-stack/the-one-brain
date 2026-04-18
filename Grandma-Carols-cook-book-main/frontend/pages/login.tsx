import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) { router.replace('/'); return null; }

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim()) { setError('Please enter your name and the family code.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(name.trim(), code.trim());
      router.replace('/');
    } catch {
      setError('Wrong family code. Ask a family member for the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌻</div>
          <h1 className="font-display text-3xl font-bold text-carol-primary">Welcome</h1>
          <p className="font-body text-sm text-carol-muted mt-2 leading-relaxed">
            This is a private space for Carol's family.<br/>Enter your name and the family code to join.
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-body font-semibold text-carol-secondary uppercase tracking-wide mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah Williams"
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-cream-50 font-body text-carol-primary text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <div>
            <label className="block text-xs font-body font-semibold text-carol-secondary uppercase tracking-wide mb-1">
              Family Code
            </label>
            <input
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Ask a family member"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-cream-50 font-body text-carol-primary text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          {error && <p className="text-red-600 text-xs font-body text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-full text-white font-body font-semibold text-sm transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)', boxShadow: '0 4px 20px rgba(201,151,58,0.4)' }}
          >
            {loading ? 'Joining...' : 'Enter the Cookbook 💛'}
          </button>
        </div>

        <p className="text-center text-xs font-body text-carol-muted mt-6">
          In loving memory of Carol Williams · 1937–2025
        </p>
      </div>
    </div>
  );
}
