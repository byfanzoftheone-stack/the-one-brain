import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';
import MediaUpload from '../components/MediaUpload';
import { useAuth } from '../utils/AuthContext';

const CATEGORIES = ['breakfast', 'holiday', 'comfort', 'baking', 'snacks', 'special'];

export default function Upload() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('special');
  const [story, setStory] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user) return (
    <div className="text-center px-6 pt-24">
      <p className="text-4xl mb-3">🔒</p>
      <p className="font-display font-semibold text-carol-primary text-lg">Family only</p>
      <p className="font-body text-sm text-carol-muted mt-1 mb-4">Please join the family first</p>
      <Link href="/login" className="inline-block px-6 py-2 rounded-full text-white text-sm font-body font-semibold"
        style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)' }}>
        Join the Family
      </Link>
    </div>
  );

  const addLine = (arr: string[], set: (a: string[]) => void) => set([...arr, '']);
  const updateLine = (arr: string[], set: (a: string[]) => void, i: number, val: string) => {
    const next = [...arr]; next[i] = val; set(next);
  };
  const removeLine = (arr: string[], set: (a: string[]) => void, i: number) => {
    if (arr.length === 1) return;
    set(arr.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    if (!title.trim()) { setError('Please add a recipe title.'); return; }
    if (ingredients.filter(Boolean).length === 0) { setError('Add at least one ingredient.'); return; }
    if (steps.filter(Boolean).length === 0) { setError('Add at least one step.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/recipes', {
        title: title.trim(),
        category,
        story_text: story.trim(),
        ingredients: ingredients.filter(Boolean),
        steps: steps.filter(Boolean),
        media_urls: mediaUrls,
        author_id: user.id,
      });
      router.push('/recipes');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-amber-200 bg-white font-body text-sm text-carol-primary focus:outline-none focus:ring-2 focus:ring-amber-300";

  return (
    <div className="px-4 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/recipes" className="text-carol-muted text-sm font-body">←</Link>
        <h1 className="font-display text-2xl font-bold text-carol-primary">Add a Recipe</h1>
      </div>

      <div className="flex flex-col gap-5">
        {/* Photos/Videos */}
        <div>
          <label className="block text-xs font-body font-semibold uppercase tracking-wide text-carol-secondary mb-2">
            Photos & Videos
          </label>
          <MediaUpload onUpload={setMediaUrls} />
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-body font-semibold uppercase tracking-wide text-carol-secondary mb-2">
            Recipe Name *
          </label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Grandma's Famous Peach Cobbler" className={inputClass} />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-body font-semibold uppercase tracking-wide text-carol-secondary mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`py-2 rounded-xl text-xs font-body font-semibold capitalize transition-all border ${
                  category === c ? 'text-white border-transparent shadow-md' : 'bg-white border-amber-200 text-carol-muted'
                }`}
                style={category === c ? { background: 'linear-gradient(135deg, #c9973a, #c47c6a)' } : {}}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Memory / Story */}
        <div>
          <label className="block text-xs font-body font-semibold uppercase tracking-wide text-carol-secondary mb-2">
            Your Memory of This Dish 💛
          </label>
          <textarea value={story} onChange={e => setStory(e.target.value)} rows={3}
            placeholder="Share the story behind this recipe — a memory, a holiday, a moment with Grandma Carol..."
            className={`${inputClass} resize-none`} />
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-xs font-body font-semibold uppercase tracking-wide text-carol-secondary mb-2">
            Ingredients *
          </label>
          <div className="flex flex-col gap-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={ing} onChange={e => updateLine(ingredients, setIngredients, i, e.target.value)}
                  placeholder={`Ingredient ${i + 1}`} className={`${inputClass} flex-1`} />
                <button onClick={() => removeLine(ingredients, setIngredients, i)}
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center text-lg shrink-0 mt-0.5">
                  ×
                </button>
              </div>
            ))}
            <button onClick={() => addLine(ingredients, setIngredients)}
              className="text-xs font-body font-semibold text-warm-gold py-2">
              ✚ Add Ingredient
            </button>
          </div>
        </div>

        {/* Steps */}
        <div>
          <label className="block text-xs font-body font-semibold uppercase tracking-wide text-carol-secondary mb-2">
            Steps *
          </label>
          <div className="flex flex-col gap-2">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2">
                <div className="shrink-0 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 mt-3">{i + 1}</div>
                <textarea value={step} onChange={e => updateLine(steps, setSteps, i, e.target.value)} rows={2}
                  placeholder={`Step ${i + 1}...`} className={`${inputClass} flex-1 resize-none`} />
                <button onClick={() => removeLine(steps, setSteps, i)}
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center text-lg shrink-0 mt-0.5">
                  ×
                </button>
              </div>
            ))}
            <button onClick={() => addLine(steps, setSteps)}
              className="text-xs font-body font-semibold text-warm-gold py-2">
              ✚ Add Step
            </button>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm font-body text-center">{error}</p>}

        <button onClick={submit} disabled={submitting}
          className="w-full py-4 rounded-2xl text-white font-body font-semibold text-base disabled:opacity-50 shadow-golden"
          style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)' }}>
          {submitting ? 'Saving Recipe...' : 'Save to the Cookbook 📖'}
        </button>
      </div>
    </div>
  );
}
