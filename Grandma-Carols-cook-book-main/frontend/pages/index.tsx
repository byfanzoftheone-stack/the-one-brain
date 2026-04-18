import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../utils/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    api.get('/recipes').then(res => {
      setFeatured(res.data.slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [featured]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative px-5 pt-12 pb-8 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-200 rounded-full opacity-20 blur-3xl" />
        </div>
        <div className="relative">
          <p className="text-xs tracking-[0.3em] uppercase text-warm-gold font-body mb-3">A Living Legacy</p>
          <h1 className="font-display text-4xl font-bold text-carol-primary leading-tight mb-2">
            Grandma Carol's
          </h1>
          <h1 className="font-display text-4xl font-bold leading-tight mb-4" style={{ color: '#c9973a' }}>
            Recipe Book
          </h1>
          <div className="divider mx-auto max-w-48 mb-4">
            <span>✦</span>
          </div>
          <p className="text-carol-muted font-body text-sm leading-relaxed max-w-sm mx-auto">
            Carol Williams · 1937–2025<br/>
            <em>"Her recipes, her love, her legacy — forever with us."</em>
          </p>

          {!user && (
            <Link href="/login"
              className="inline-block mt-6 px-8 py-3 rounded-full text-white font-body font-semibold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)', boxShadow: '0 4px 20px rgba(201,151,58,0.4)' }}
            >
              Join the Family
            </Link>
          )}
          {user && (
            <p className="mt-4 text-sm font-body text-carol-muted">
              Welcome back, <span className="font-semibold text-carol-secondary">{user.name}</span> 💛
            </p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="px-5 mb-8">
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/recipes',     icon: '📖', label: 'All Recipes',    sub: 'Browse the cookbook'  },
            { href: '/memory-wall', icon: '🌻', label: 'Memory Wall',    sub: 'Photos & videos'      },
            { href: '/upload',      icon: '✚',  label: 'Add a Recipe',   sub: 'Share your version'   },
            { href: '/memory-wall', icon: '🎙️', label: "Carol's Story",  sub: 'Her 4-min interview'  },
          ].map(({ href, icon, label, sub }) => (
            <Link key={label} href={user ? href : '/login'}>
              <div className="glass-card p-4 flex flex-col gap-1 hover:shadow-golden transition-shadow cursor-pointer">
                <span className="text-2xl">{icon}</span>
                <p className="font-display font-semibold text-carol-primary text-sm">{label}</p>
                <p className="font-body text-xs text-carol-muted">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Recipes */}
      <div className="px-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-carol-primary">Family Favorites</h2>
          <Link href="/recipes" className="text-xs font-body text-warm-gold font-semibold">See all →</Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-carol-muted font-body text-sm">Loading recipes...</div>
        ) : featured.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-display font-semibold text-carol-primary mb-1">No recipes yet</p>
            <p className="text-sm font-body text-carol-muted mb-4">Be the first to add one of Grandma Carol's recipes</p>
            <Link href={user ? '/upload' : '/login'}
              className="inline-block px-6 py-2 rounded-full text-white text-sm font-body font-semibold"
              style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)' }}
            >
              Add First Recipe
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {featured.map((r, i) => (
              <div key={r.id} className={`reveal delay-${i + 1}`}>
                <RecipeCard recipe={r} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Carol quote */}
      <div className="mx-5 mb-10 p-6 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, #faf0dc, #f5deb3)' }}>
        <p className="text-3xl mb-3">💛</p>
        <p className="font-display italic text-carol-secondary text-lg leading-relaxed">
          "She'd help anyone. Her heart was pure — her morals, her choices, her marriage, her love."
        </p>
        <p className="text-xs font-body text-carol-muted mt-3 tracking-wide">— In loving memory of Carol Williams</p>
      </div>
    </div>
  );
}
