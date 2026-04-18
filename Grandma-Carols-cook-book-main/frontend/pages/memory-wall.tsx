import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import MemoryCard from '../components/MemoryCard';
import MediaUpload from '../components/MediaUpload';
import { useAuth } from '../utils/AuthContext';

export default function MemoryWall() {
  const { user } = useAuth();
  const router = useRouter();
  const [memories, setMemories] = useState<any[]>([]);
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get('/memory-wall').then(res => {
      const all = res.data;
      setInterview(all.find((m: any) => m.is_interview));
      setMemories(all.filter((m: any) => !m.is_interview));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!title.trim() || !user) return;
    setSubmitting(true);
    try {
      await api.post('/memory-wall', { title: title.trim(), memory_text: text.trim(), media_urls: mediaUrls, uploaded_by: user.id });
      setTitle(''); setText(''); setMediaUrls([]); setShowForm(false);
      load();
    } catch { } finally { setSubmitting(false); }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-amber-200 bg-white font-body text-sm text-carol-primary focus:outline-none focus:ring-2 focus:ring-amber-300";

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold text-carol-primary">Memory Wall</h1>
        {user && (
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-full text-white text-xs font-body font-semibold"
            style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)' }}>
            {showForm ? 'Cancel' : '✚ Memory'}
          </button>
        )}
      </div>

      {/* Carol's Interview — always pinned top */}
      {interview && (
        <div className="mb-5">
          <p className="text-xs font-body font-semibold uppercase tracking-wider text-warm-gold mb-2">✨ Her Story</p>
          <MemoryCard memory={interview} />
        </div>
      )}

      {/* Add Memory Form */}
      {showForm && (
        <div className="glass-card p-4 mb-5 flex flex-col gap-4">
          <h3 className="font-display font-semibold text-carol-primary">Share a Memory</h3>
          <MediaUpload onUpload={setMediaUrls} label="Add Photos or Videos from Your Device" />
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Title (e.g. Christmas 2019)" className={inputClass} />
          <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
            placeholder="Share your memory of Grandma Carol..." className={`${inputClass} resize-none`} />
          <button onClick={submit} disabled={submitting || !title.trim()}
            className="w-full py-3 rounded-xl text-white font-body font-semibold text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #c9973a, #c47c6a)' }}>
            {submitting ? 'Saving...' : 'Share Memory 💛'}
          </button>
        </div>
      )}

      {/* Memory grid */}
      {loading ? (
        <div className="text-center py-16 text-carol-muted font-body text-sm">Loading memories...</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🌻</p>
          <p className="font-display font-semibold text-carol-primary">No memories yet</p>
          <p className="text-sm font-body text-carol-muted mt-1">Share your favorite moments with Grandma Carol</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-4">
          {memories.map(m => <MemoryCard key={m.id} memory={m} />)}
        </div>
      )}
    </div>
  );
}
