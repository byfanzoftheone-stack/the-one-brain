import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../utils/AuthContext';

const CATEGORIES = ['all', 'breakfast', 'holiday', 'comfort', 'baking', 'snacks', 'special'];

export default function RecipesFeed() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/recipes').then(res => { setRecipes(res.data); setFiltered(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = recipes;
    if (cat !== 'all') list = list.filter(r => r.category === cat);
    if (search) list = list.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.story_text?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [cat, search, recipes]);

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold text-carol-primary">Recipes</h1>
        {user && (
          <Link href="/upload"
            className="px-4 py-2 rounded-full text-white text-xs font-body font-semibold"
            style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)' }}
          >
            ✚ Add
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-carol-muted">🔍</span>
        <input
          type="search"
          placeholder="Search recipes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-amber-200 bg-white font-body text-sm text-carol-primary focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-body font-semibold capitalize transition-all ${
              cat === c
                ? 'text-white shadow-md'
                : 'bg-white border border-amber-200 text-carol-muted'
            }`}
            style={cat === c ? { background: 'linear-gradient(135deg, #c9973a, #c47c6a)' } : {}}
          >
            {c === 'all' ? '🍴 All' : c}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-16 text-carol-muted font-body">Loading recipes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="font-display font-semibold text-carol-primary">No recipes found</p>
          <p className="text-sm font-body text-carol-muted mt-1">
            {search ? 'Try a different search' : 'Be the first to add one!'}
          </p>
          {user && (
            <Link href="/upload"
              className="inline-block mt-4 px-6 py-2 rounded-full text-white text-sm font-body font-semibold"
              style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)' }}
            >
              Add Recipe
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-4">
          {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </div>
  );
}
