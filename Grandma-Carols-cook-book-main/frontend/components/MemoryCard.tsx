interface Memory {
  id: number;
  title: string;
  media_urls?: string[];
  memory_text?: string;
  uploader_name?: string;
  is_interview?: boolean;
  created_at: string;
}

export default function MemoryCard({ memory }: { memory: Memory }) {
  const media = memory.media_urls?.[0];
  const isVideo = media && /\.(mp4|mov|avi|m4v)$/i.test(media);

  return (
    <div className="glass-card overflow-hidden">
      {memory.is_interview && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <span className="text-amber-600 text-sm">✨</span>
          <span className="text-amber-800 text-xs font-semibold uppercase tracking-wide font-body">
            Grandma Carol's Story
          </span>
        </div>
      )}
      {media && (
        isVideo ? (
          <video
            src={media}
            className="media-thumb"
            controls
            playsInline
            poster={memory.media_urls?.[1]}
          />
        ) : (
          <img src={media} alt={memory.title} className="media-thumb" />
        )
      )}
      {!media && (
        <div className="media-thumb flex items-center justify-center text-5xl bg-amber-50">🌻</div>
      )}
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg text-carol-primary leading-tight">
          {memory.title}
        </h3>
        {memory.memory_text && (
          <p className="text-sm text-carol-muted mt-2 leading-relaxed font-body">
            {memory.memory_text}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs text-carol-muted font-body">
          <span>💛 {memory.uploader_name || 'Family'}</span>
          <span>·</span>
          <span>{new Date(memory.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
