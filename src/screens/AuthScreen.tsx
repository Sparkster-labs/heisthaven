import { useState } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';

interface AuthScreenProps {
  onAuth: () => void;
  onSkip?: () => void;
}

const AuthScreen = ({ onAuth, onSkip }: AuthScreenProps) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onAuth();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    background: THEME.colors.shadow,
    border: `1px solid ${THEME.colors.borderFaint}`,
    borderRadius: THEME.radius.sm,
    color: THEME.colors.textPrimary,
    fontFamily: THEME.fonts.mono,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={S.page}>
      <div
        className="screen-enter"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: THEME.space.lg,
        }}
      >
        {/* Title */}
        <h1
          className="gold-shimmer"
          style={{
            fontFamily: THEME.fonts.display,
            fontSize: 36,
            letterSpacing: 6,
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: THEME.space.sm,
          }}
        >
          THE GIFT HEIST
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: THEME.fonts.body,
            fontStyle: 'italic',
            fontSize: 14,
            color: THEME.colors.textSecondary,
            textAlign: 'center',
            marginBottom: THEME.space.xl,
            lineHeight: 1.6,
          }}
        >
          Every city has its rats. Be the one they fear.
        </p>

        {/* Form card */}
        <div
          style={{
            ...S.card,
            width: '100%',
            maxWidth: 360,
          }}
        >
          <div style={{ ...S.eyebrow, textAlign: 'center', marginBottom: THEME.space.lg }}>
            {mode === 'forgot' ? 'Reset Password' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </div>

          {mode === 'forgot' && resetSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: THEME.space.md }}>📧</div>
              <p style={{ fontFamily: THEME.fonts.mono, fontSize: 12, color: THEME.colors.textSecondary, marginBottom: THEME.space.lg, lineHeight: 1.6 }}>
                Check your email for a password reset link.
              </p>
              <button onClick={() => { setMode('login'); setResetSent(false); setError(''); }} style={{ ...S.btnGhost, fontSize: 10 }}>
                BACK TO SIGN IN
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.md }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = THEME.colors.gold)}
                  onBlur={(e) => (e.target.style.borderColor = THEME.colors.borderFaint)}
                />
                {mode !== 'forgot' && (
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = THEME.colors.gold)}
                    onBlur={(e) => (e.target.style.borderColor = THEME.colors.borderFaint)}
                  />
                )}

                {error && (
                  <div style={{ color: THEME.colors.danger, fontSize: 12, fontFamily: THEME.fonts.mono, textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  ...S.btnPrimary, opacity: loading ? 0.6 : 1, marginTop: THEME.space.sm,
                }}>
                  {loading ? 'PROCESSING...' : mode === 'forgot' ? 'SEND RESET LINK' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
                </button>
              </form>

              {mode === 'login' && (
                <button
                  onClick={() => { setMode('forgot'); setError(''); }}
                  style={{ ...S.btnGhost, fontSize: 10, marginTop: THEME.space.sm }}
                >
                  FORGOT PASSWORD?
                </button>
              )}

              <div style={S.divider} />

              <button
                onClick={() => { setMode(mode === 'signup' ? 'login' : mode === 'forgot' ? 'login' : 'signup'); setError(''); setResetSent(false); }}
                style={{ ...S.btnGhost, fontSize: 10 }}
              >
                {mode === 'signup' ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : mode === 'forgot' ? 'BACK TO SIGN IN' : 'NEW HERE? CREATE ACCOUNT'}
              </button>
            </>
          )}

          {onSkip && (
            <>
              <div style={S.divider} />
              <button
                onClick={onSkip}
                style={{
                  ...S.btnGhost,
                  fontSize: 9,
                  color: THEME.colors.textMuted,
                  letterSpacing: 2,
                }}
              >
                ⚠️ SKIP SIGN IN (DEV MODE)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
