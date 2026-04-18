import Link from 'next/link';

const CAT_COLORS: Record<string, string> = {
  breakfast: 'cat-breakfast',
  holiday:   'cat-holiday',
  comfort:   'cat-comfort',
  baking:    'cat-baking',
  snacks:    'cat-snacks',
  special:   'cat-special',
};

interface Recipe {
  id: number;
  title: string;
  category: string;
  story_text?: string;
  media_urls?: string[];
  author_name?: string;
  created_at: string;
}

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const thumb = recipe.media_urls?.[0];
  const catClass = CAT_COLORS[recipe.category] || 'cat-special';

  return (
    <Link href={`/recipes/${recipe.id}`} className="block">
      <div className="recipe-card">
        {thumb ? (
          <img src={thumb} alt={recipe.title} className="media-thumb" />
        ) : (
          <div className="media-thumb flex items-center justify-center text-5xl bg-amber-50">🍽️</div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-semibold text-lg leading-tight text-carol-primary">
              {recipe.title}
            </h3>
            <span className={`badge ${catClass} shrink-0`}>{recipe.category}</span>
          </div>
          {recipe.story_text && (
            <p className="text-sm text-carol-muted line-clamp-2 mt-1 font-body leading-relaxed">
              {recipe.story_text}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs text-carol-muted font-body">
            <span>👩‍🍳 {recipe.author_name || 'Family'}</span>
            <span>·</span>
            <span>{new Date(recipe.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
