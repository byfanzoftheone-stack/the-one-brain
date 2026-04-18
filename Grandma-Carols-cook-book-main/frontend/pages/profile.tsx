import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../utils/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get(`/users/${user.id}`).then(res => { setProfile(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const handleLogout = () => { logout(); router.push('/'); };

  if (!user) return (
    <div className="text-center px-6 pt-24">
      <p className="text-4xl mb-3">👤</p>
      <p className="font-display font-semibold text-carol-primary text-lg mb-4">Your Family Profile</p>
      <Link href="/login" className="inline-block px-6 py-2 rounded-full text-white text-sm font-body font-semibold"
        style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)' }}>
        Join the Family
      </Link>
    </div>
  );

  if (loading) return <div className="text-center pt-24 text-carol-muted font-body">Loading...</div>;

  return (
    <div className="px-4 pt-6">
      {/* Profile header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-4xl mx-auto mb-3 border-4 border-amber-200">
          {user.profile_photo ? (
            <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover rounded-full" />
          ) : '👤'}
        </div>
        <h1 className="font-display text-2xl font-bold text-carol-primary">{user.name}</h1>
        <p className="font-body text-sm text-carol-muted mt-1">
          {profile?.recipes?.length || 0} recipe{profile?.recipes?.length !== 1 ? 's' : ''} contributed
        </p>
        <div className="divider mx-auto max-w-32 mt-3"><span>💛</span></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: '📖', count: profile?.recipes?.length || 0, label: 'Recipes' },
          { icon: '💬', count: 0, label: 'Memories' },
          { icon: '🌻', count: 0, label: 'Photos' },
        ].map(({ icon, count, label }) => (
          <div key={label} className="glass-card p-3 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <div className="font-display font-bold text-xl text-carol-primary">{count}</div>
            <div className="font-body text-xs text-carol-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* My Recipes */}
      {profile?.recipes?.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-carol-primary mb-4">My Recipes</h2>
          <div className="flex flex-col gap-4">
            {profile.recipes.map((r: any) => <RecipeCard key={r.id} recipe={{ ...r, author_name: user.name }} />)}
          </div>
        </div>
      )}

      {profile?.recipes?.length === 0 && (
        <div className="text-center py-8 glass-card mb-8">
          <p className="text-3xl mb-2">📖</p>
          <p className="font-display font-semibold text-carol-primary">No recipes yet</p>
          <p className="font-body text-sm text-carol-muted mt-1 mb-4">Add one of Grandma Carol's favorites</p>
          <Link href="/upload" className="inline-block px-6 py-2 rounded-full text-white text-sm font-body font-semibold"
            style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)' }}>
            Add Recipe
          </Link>
        </div>
      )}

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full py-3 rounded-xl border border-red-200 text-red-400 font-body text-sm font-semibold">
        Sign Out
      </button>

      <p className="text-center text-xs font-body text-carol-muted mt-6">
        In loving memory of Carol Williams · 1937–2025
      </p>
    </div>
  );
}
