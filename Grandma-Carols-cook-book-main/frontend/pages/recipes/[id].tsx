import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

const CAT_COLORS: Record<string, string> = {
  breakfast: 'cat-breakfast', holiday: 'cat-holiday', comfort: 'cat-comfort',
  baking: 'cat-baking', snacks: 'cat-snacks', special: 'cat-special',
};

export default function RecipeDetail() {
  const { query } = useRouter();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [activeMedia, setActiveMedia] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.id) return;
    api.get(`/recipes/${query.id}`).then(res => { setRecipe(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [query.id]);

  const postComment = async () => {
    if (!comment.trim() || !user) return;
    setPosting(true);
    try {
      await api.post(`/recipes/${query.id}/comments`, { user_id: user.id, comment_text: comment.trim() });
      const res = await api.get(`/recipes/${query.id}`);
      setRecipe(res.data);
      setComment('');
    } catch { } finally { setPosting(false); }
  };

  if (loading) return <div className="text-center pt-24 text-carol-muted font-body">Loading...</div>;
  if (!recipe) return <div className="text-center pt-24 font-body text-carol-muted">Recipe not found.</div>;

  const isVideo = (url: string) => /\.(mp4|mov|avi|m4v)$/i.test(url);

  return (
    <div className="pb-8">
      {/* Back */}
      <div className="px-4 pt-4">
        <Link href="/recipes" className="text-xs font-body text-carol-muted flex items-center gap-1">
          ← Back to Recipes
        </Link>
      </div>

      {/* Media gallery */}
      {recipe.media_urls?.length > 0 && (
        <div className="mt-3">
          <div className="aspect-video bg-amber-50 overflow-hidden">
            {isVideo(recipe.media_urls[activeMedia]) ? (
              <video src={recipe.media_urls[activeMedia]} className="w-full h-full object-cover" controls playsInline />
            ) : (
              <img src={recipe.media_urls[activeMedia]} alt={recipe.title} className="w-full h-full object-cover" />
            )}
          </div>
          {recipe.media_urls.length > 1 && (
            <div className="flex gap-2 px-4 mt-2 overflow-x-auto">
              {recipe.media_urls.map((url: string, i: number) => (
                <button key={i} onClick={() => setActiveMedia(i)}
                  className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeMedia === i ? 'border-amber-400' : 'border-transparent'}`}
                >
                  {isVideo(url)
                    ? <div className="w-full h-full bg-amber-100 flex items-center justify-center text-xl">▶</div>
                    : <img src={url} className="w-full h-full object-cover" />
                  }
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 mt-5">
        {/* Title + category */}
        <div className="flex items-start gap-3 mb-1">
          <h1 className="font-display text-2xl font-bold text-carol-primary leading-tight flex-1">{recipe.title}</h1>
          <span className={`badge ${CAT_COLORS[recipe.category] || 'cat-special'} shrink-0 mt-1`}>{recipe.category}</span>
        </div>
        <p className="text-xs font-body text-carol-muted mb-4">
          👩‍🍳 {recipe.author_name || 'Family'} · {new Date(recipe.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Story / memory */}
        {recipe.story_text && (
          <div className="glass-card p-4 mb-5">
            <p className="text-xs font-body font-semibold uppercase tracking-wide text-warm-gold mb-2">💛 Memory</p>
            <p className="font-body text-sm text-carol-secondary leading-relaxed italic">{recipe.story_text}</p>
          </div>
        )}

        {/* Ingredients */}
        <div className="mb-5">
          <h2 className="font-display text-lg font-bold text-carol-primary mb-3">Ingredients</h2>
          <ul className="flex flex-col gap-2">
            {recipe.ingredients.map((ing: string, i: number) => (
              <li key={i} className="flex items-start gap-3 font-body text-sm text-carol-secondary">
                <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs text-amber-700 shrink-0 mt-0.5 font-semibold">{i + 1}</span>
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-carol-primary mb-3">Steps</h2>
          <ol className="flex flex-col gap-4">
            {recipe.steps.map((step: string, i: number) => (
              <li key={i} className="glass-card p-4">
                <div className="flex gap-3">
                  <span className="font-display text-2xl font-bold text-amber-300 leading-none shrink-0">{i + 1}</span>
                  <p className="font-body text-sm text-carol-secondary leading-relaxed pt-1">{step}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Comments / Memories */}
        <div>
          <div className="divider mb-4"><span>Memories</span></div>
          <div className="flex flex-col gap-3 mb-4">
            {recipe.comments?.length === 0 && (
              <p className="text-center text-sm font-body text-carol-muted py-4">No memories yet — be the first to share one!</p>
            )}
            {recipe.comments?.map((c: any) => (
              <div key={c.id} className="glass-card p-3">
                <p className="text-xs font-body font-semibold text-warm-gold mb-1">{c.user_name || 'Family'}</p>
                <p className="text-sm font-body text-carol-secondary leading-relaxed">{c.comment_text}</p>
                <p className="text-xs text-carol-muted mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          {user ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share a memory about this dish..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white font-body text-sm text-carol-primary focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              />
              <button
                onClick={postComment}
                disabled={posting || !comment.trim()}
                className="self-end px-6 py-2 rounded-full text-white text-sm font-body font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)' }}
              >
                {posting ? 'Posting...' : 'Share Memory 💛'}
              </button>
            </div>
          ) : (
            <Link href="/login" className="block text-center text-sm font-body text-warm-gold font-semibold">
              Join the family to share a memory →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
