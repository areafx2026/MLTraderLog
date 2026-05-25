import { useState } from 'react';

export default function DeleteAccount({ t, token, onCancel, onDeleted }) {
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const confirmed = input.trim().toLowerCase() === 'delete';

  const handleDeleteClick = () => {
    if (!confirmed) return;
    setError('');
    setShowModal(true);
  };

  const handleFinalDelete = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Error ${res.status}`);
        setLoading(false);
        setShowModal(false);
        return;
      }
      onDeleted();
    } catch {
      setError('Connection failed. Please try again.');
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0 }}>
      <header style={{ marginBottom: 48 }}>
        <div style={{
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 14,
          color: t.ink2, marginBottom: 8,
        }}>
          Account
        </div>
        <h1 style={{
          fontFamily: t.serif, fontWeight: 400, fontSize: 44, margin: 0,
          letterSpacing: -0.8, lineHeight: 1.05, color: t.ink,
        }}>
          Delete account
        </h1>
      </header>

      <div style={{ maxWidth: 480 }}>
        <div style={{
          padding: '24px 28px', borderRadius: 10, marginBottom: 40,
          background: `rgba(${t.loss === '#b5613f' ? '181,97,63' : t.loss === '#c98363' ? '201,131,99' : '225,29,72'}, .08)`,
          border: `1px solid ${t.loss}22`,
        }}>
          <p style={{ fontFamily: t.serif, fontSize: 16, color: t.ink, margin: '0 0 8px', fontWeight: 500 }}>
            This cannot be undone.
          </p>
          <p style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: t.ink2, margin: 0, lineHeight: 1.6 }}>
            Deleting your account will permanently remove all your trades, settings,
            and personal data. There is no way to recover this data afterwards.
          </p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{
            display: 'block', fontFamily: t.serif, fontStyle: 'italic',
            fontSize: 14, color: t.ink2, marginBottom: 10,
          }}>
            Type <strong style={{ fontStyle: 'normal', color: t.ink, fontFamily: t.mono }}>delete</strong> to continue
          </label>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="delete"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            style={{
              padding: '11px 14px', fontSize: 14, fontFamily: t.mono,
              background: t.bg, color: t.ink,
              border: `1px solid ${confirmed ? t.loss : t.rule2}`,
              borderRadius: 6, outline: 'none', width: 220, boxSizing: 'border-box',
              transition: 'border-color .15s',
            }}
          />
        </div>

        {error && (
          <div style={{
            fontSize: 13, color: t.loss, marginBottom: 20,
            padding: '10px 14px', background: `${t.loss}12`, borderRadius: 6,
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel}
            style={{
              background: 'transparent', color: t.ink2,
              border: `1px solid ${t.rule2}`,
              padding: '11px 22px', borderRadius: 999, fontFamily: t.sans,
              fontWeight: 500, fontSize: 14, cursor: 'pointer',
            }}>
            Cancel
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={!confirmed}
            style={{
              background: confirmed ? t.loss : 'transparent',
              color: confirmed ? '#fff' : t.ink3,
              border: `1px solid ${confirmed ? t.loss : t.rule2}`,
              padding: '11px 22px', borderRadius: 999, fontFamily: t.sans,
              fontWeight: 600, fontSize: 14,
              cursor: confirmed ? 'pointer' : 'not-allowed',
              transition: 'background .15s, color .15s, border-color .15s',
            }}>
            Delete account
          </button>
        </div>
      </div>

      {/* ── Confirmation modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: t.paper, borderRadius: 14,
            padding: '36px 40px', maxWidth: 420, width: '90%',
            border: `1px solid ${t.rule2}`,
            boxShadow: '0 24px 64px rgba(0,0,0,.28)',
          }}>
            <h2 style={{
              fontFamily: t.serif, fontWeight: 400, fontSize: 26,
              color: t.ink, margin: '0 0 12px', letterSpacing: -0.4,
            }}>
              Are you absolutely sure?
            </h2>
            <p style={{
              fontFamily: t.serif, fontStyle: 'italic', fontSize: 15,
              color: t.ink2, margin: '0 0 32px', lineHeight: 1.6,
            }}>
              Your account, all trades, and all data will be permanently deleted.
              This action is irreversible and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                style={{
                  background: 'transparent', color: t.ink2,
                  border: `1px solid ${t.rule2}`,
                  padding: '11px 22px', borderRadius: 999, fontFamily: t.sans,
                  fontWeight: 500, fontSize: 14, cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button
                onClick={handleFinalDelete}
                disabled={loading}
                style={{
                  background: t.loss, color: '#fff',
                  border: 'none',
                  padding: '11px 22px', borderRadius: 999, fontFamily: t.sans,
                  fontWeight: 600, fontSize: 14,
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}>
                {loading ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
