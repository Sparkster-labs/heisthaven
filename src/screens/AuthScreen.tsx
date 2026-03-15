import { useState } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';

interface AuthScreenProps {
  onAuth: () => void;
}

const AuthScreen = ({ onAuth }: AuthScreenProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
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
          style={{
            fontFamily: THEME.fonts.display,
            fontSize: 36,
            color: THEME.colors.gold,
            letterSpacing: 6,
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: THEME.space.sm,
            textShadow: '0 0 40px rgba(232,184,75,0.3)',
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
            {isSignUp ? 'Create Account' : 'Sign In'}
          </div>

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

            {error && (
              <div style={{ color: THEME.colors.danger, fontSize: 12, fontFamily: THEME.fonts.mono, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...S.btnPrimary,
                opacity: loading ? 0.6 : 1,
                marginTop: THEME.space.sm,
              }}
            >
              {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>
          </form>

          <div style={S.divider} />

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={{
              ...S.btnGhost,
              fontSize: 10,
            }}
          >
            {isSignUp ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : 'NEW HERE? CREATE ACCOUNT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
