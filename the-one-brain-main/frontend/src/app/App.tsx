import React, { useMemo, useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { speak } from '../engines/voice';
import { composeAvatar } from '../engines/avatar';

type Stage = 'Baby' | 'Child' | 'Teen' | 'Adult' | 'Mentor';
type AudienceMode = 'child' | 'teen' | 'adult' | 'senior';

const STAGES: Stage[] = ['Baby', 'Child', 'Teen', 'Adult', 'Mentor'];

const STAGE_XP: Record<Stage, number> = {
  Baby: 0,
  Child: 250,
  Teen: 750,
  Adult: 1750,
  Mentor: 3500,
};

const STAGE_COLORS: Record<Stage, string> = {
  Baby: '#7ec8e3',
  Child: '#90ee90',
  Teen: '#ffb347',
  Adult: '#9b59b6',
  Mentor: '#f1c40f',
};

interface Message {
  role: 'user' | 'one';
  text: string;
  curiosity?: string;
  xp_delta?: number;
  stage?: Stage;
}

export default function App() {
  const [displayName, setDisplayName] = useState('Travis');
  const [userId, setUserId] = useState<number | null>(null);

  const [companionName, setCompanionName] = useState('The One');
  const [companionId, setCompanionId] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>('Baby');
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState(0);

  const [audienceMode, setAudienceMode] = useState<AudienceMode>('adult');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [imgs, setImgs] = useState<[File | null, File | null, File | null]>([null, null, null]);

  const [input, setInput] = useState('');
  const [log, setLog] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_BASE as string) || 'http://127.0.0.1:8787',
    []
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  async function ensureUser(): Promise<number> {
    if (userId) return userId;
    const res = await api(apiBase).createUser(displayName);
    setUserId(res.user.id);
    return res.user.id as number;
  }

  async function ensureCompanion(): Promise<number> {
    const uid = await ensureUser();
    if (companionId) return companionId;
    const res = await api(apiBase).createCompanion(uid, companionName, stage);
    setCompanionId(res.companion.id);
    setStage(res.companion.stage);
    setXp(res.companion.xp);
    return res.companion.id as number;
  }

  async function onStart() {
    setError(null);
    try {
      await ensureCompanion();
      setStarted(true);
    } catch (e: any) {
      setError('Could not connect to THE ONE backend. Is it running?');
    }
  }

  async function onComposeAvatar() {
    if (!imgs[0] || !imgs[1] || !imgs[2]) {
      alert('Choose 3 photos first.');
      return;
    }
    try {
      const cid = await ensureCompanion();
      void cid;
      const blob = await composeAvatar(apiBase, stage, imgs[0], imgs[1], imgs[2]);
      setAvatarUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setError('Avatar compose failed: ' + e.message);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    setLoading(true);

    const uid = await ensureUser();
    const cid = await ensureCompanion();

    setLog(l => [...l, { role: 'user', text }]);
    setInput('');

    try {
      const res = await api(apiBase).chat(uid, cid, text, audienceMode);
      const r = res.reply;

      setStage(res.companion.stage);
      setXp(res.companion.xp);
      setProgress(r.stage_progress);

      setLog(l => [
        ...l,
        {
          role: 'one',
          text: r.assistant_text,
          curiosity: r.curiosity_question,
          xp_delta: r.xp_delta,
          stage: r.stage_after,
        },
      ]);

      if (voiceEnabled) {
        speak(r.assistant_text, r.voice?.rate ?? 1.0, r.voice?.pitch ?? 1.0);
      }
    } catch (e: any) {
      setError('Send failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  const stageColor = STAGE_COLORS[stage];
  const nextStage = STAGES[STAGES.indexOf(stage) + 1];
  const nextXp = nextStage ? STAGE_XP[nextStage] : null;

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: 680,
        margin: '0 auto',
        padding: '16px',
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#f0f0f0',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -1 }}>
            THE ONE{' '}
            <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 400, letterSpacing: 0 }}>
              TM – FanzoftheOne
            </span>
          </h1>
          <div style={{ fontSize: 12, opacity: 0.4, marginTop: 2 }}>
            Co-Evolving Cognitive Companion
          </div>
        </div>
        <div
          style={{
            background: stageColor,
            color: '#000',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {stage}
        </div>
      </div>

      {/* Setup panel */}
      {!started ? (
        <div
          style={{
            background: '#161616',
            borderRadius: 16,
            padding: 20,
            border: '1px solid #2a2a2a',
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
            Initialize
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
              style={inputStyle}
            />
            <input
              value={companionName}
              onChange={e => setCompanionName(e.target.value)}
              placeholder="Companion name"
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as Stage)}
                style={{ ...inputStyle, flex: 1 }}
              >
                {STAGES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={audienceMode}
                onChange={e => setAudienceMode(e.target.value as AudienceMode)}
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="child">Child Mode</option>
                <option value="teen">Teen Mode</option>
                <option value="adult">Adult Mode</option>
                <option value="senior">Senior Mode</option>
              </select>
            </div>

            <button onClick={onStart} style={primaryBtnStyle(stageColor)}>
              Start THE ONE
            </button>
          </div>

          {error && <div style={errorStyle}>{error}</div>}
        </div>
      ) : (
        <>
          {/* Avatar + growth */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 16,
              background: '#161616',
              borderRadius: 16,
              padding: 16,
              border: '1px solid #2a2a2a',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 12,
                overflow: 'hidden',
                border: `2px solid ${stageColor}`,
                flexShrink: 0,
                background: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                opacity: avatarUrl ? 1 : 0.4,
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                'No avatar'
              )}
            </div>

            {/* Growth info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{companionName}</span>
                <span style={{ fontSize: 12, opacity: 0.5 }}>
                  {xp} XP {nextStage ? `→ ${nextXp} for ${nextStage}` : '• MAX'}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: '#2a2a2a', borderRadius: 999, overflow: 'hidden', marginBottom: 10 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round(progress * 100)}%`,
                    background: stageColor,
                    borderRadius: 999,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>

              {/* Avatar upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[0, 1, 2].map(i => (
                    <label key={i} style={uploadLabelStyle}>
                      {imgs[i] ? '✓ ' + imgs[i]!.name.slice(0, 8) + '…' : `Photo ${i + 1}`}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const f = e.target.files?.[0] ?? null;
                          setImgs(v => {
                            const next = [...v] as [File | null, File | null, File | null];
                            next[i] = f;
                            return next;
                          });
                        }}
                      />
                    </label>
                  ))}
                </div>
                <button onClick={onComposeAvatar} style={secondaryBtnStyle}>
                  Birth / Update Avatar
                </button>
              </div>
            </div>
          </div>

          {/* Chat log */}
          <div
            style={{
              background: '#161616',
              borderRadius: 16,
              padding: 16,
              minHeight: 300,
              maxHeight: 420,
              overflowY: 'auto',
              marginBottom: 12,
              border: '1px solid #2a2a2a',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {log.length === 0 && (
              <div style={{ opacity: 0.3, fontSize: 13, textAlign: 'center', marginTop: 60 }}>
                Say something to THE ONE…
              </div>
            )}

            {log.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.4,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {m.role === 'user' ? displayName : companionName}
                  {m.xp_delta != null && m.xp_delta > 0 && (
                    <span style={{ color: stageColor, marginLeft: 8 }}>+{m.xp_delta} XP</span>
                  )}
                </div>
                <div
                  style={{
                    background: m.role === 'user' ? '#1e1e1e' : '#0f0f0f',
                    borderLeft: m.role === 'one' ? `3px solid ${stageColor}` : '3px solid #333',
                    padding: '10px 12px',
                    borderRadius: '0 10px 10px 0',
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.text}
                </div>
                {m.curiosity && (
                  <div
                    style={{
                      background: '#111',
                      border: `1px solid ${stageColor}33`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      color: stageColor,
                      marginTop: 2,
                    }}
                  >
                    💭 {m.curiosity}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Talk to ${companionName}…`}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) send();
              }}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={primaryBtnStyle(stageColor)}
            >
              {loading ? '…' : '→'}
            </button>
            <button
              onClick={() => setVoiceEnabled(v => !v)}
              title={voiceEnabled ? 'Voice on' : 'Voice off'}
              style={{
                ...secondaryBtnStyle,
                opacity: voiceEnabled ? 1 : 0.3,
                padding: '10px 12px',
              }}
            >
              🔊
            </button>
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          {/* Footer */}
          <div style={{ marginTop: 16, fontSize: 11, opacity: 0.25, textAlign: 'center' }}>
            THE ONE never coerces or overrides you. You control memory and exports.
          </div>
        </>
      )}
    </div>
  );
}

// ---- Shared styles ----

const inputStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: 10,
  color: '#f0f0f0',
  padding: '10px 14px',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const primaryBtnStyle = (color: string): React.CSSProperties => ({
  background: color,
  color: '#000',
  border: 'none',
  borderRadius: 10,
  padding: '10px 20px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

const secondaryBtnStyle: React.CSSProperties = {
  background: '#1a1a1a',
  color: '#f0f0f0',
  border: '1px solid #2a2a2a',
  borderRadius: 10,
  padding: '7px 14px',
  fontSize: 12,
  cursor: 'pointer',
};

const uploadLabelStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px dashed #3a3a3a',
  borderRadius: 8,
  padding: '5px 10px',
  fontSize: 11,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  maxWidth: 90,
};

const errorStyle: React.CSSProperties = {
  marginTop: 10,
  background: '#2a0000',
  border: '1px solid #ff4444',
  color: '#ff8888',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
};
