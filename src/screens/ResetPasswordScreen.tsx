import { useState, useEffect } from 'react';
import { THEME, S } from '@/styles/theme';
import { supabase } from '@/integrations/supabase/client';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      // Redirect to home after a moment
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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

  if (!isRecovery) {
    return (
      <div style={S.page}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: THEME.space.lg,
        }}>
          <div style={{ ...S.card, width: '100%', maxWidth: 360, textAlign: 'center' }}>
            <div style={{ ...S.eyebrow, marginBottom: THEME.space.md }}>INVALID LINK</div>
            <p style={{ fontFamily: THEME.fonts.mono, fontSize: 12, color: THEME.colors.textSecondary, marginBottom: THEME.space.lg }}>
              This reset link is invalid or has expired.
            </p>
            <button
              onClick={() => { window.location.href = window.location.origin; }}
              style={S.btnPrimary}
            >
              BACK TO LOGIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', padding: THEME.space.lg,
      }}>
        <h1 className="gold-shimmer" style={{
          fontFamily: THEME.fonts.display, fontSize: 28, letterSpacing: 4,
          textTransform: 'uppercase', textAlign: 'center', marginBottom: THEME.space.xl,
        }}>
          NEW PASSWORD
        </h1>

        <div style={{ ...S.card, width: '100%', maxWidth: 360 }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: THEME.space.md }}>✅</div>
              <div style={{ ...S.eyebrow, color: THEME.colors.emerald, marginBottom: THEME.space.sm }}>
                PASSWORD UPDATED
              </div>
              <p style={{ fontFamily: THEME.fonts.mono, fontSize: 12, color: THEME.colors.textSecondary }}>
                Redirecting you back in...
              </p>
            </div>
          ) : (
            <>
              <div style={{ ...S.eyebrow, textAlign: 'center', marginBottom: THEME.space.lg }}>
                Set New Password
              </div>
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: THEME.space.md }}>
                <input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = THEME.colors.gold)}
                  onBlur={(e) => (e.target.style.borderColor = THEME.colors.borderFaint)}
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <button type="submit" disabled={loading} style={{
                  ...S.btnPrimary, opacity: loading ? 0.6 : 1, marginTop: THEME.space.sm,
                }}>
                  {loading ? 'UPDATING...' : 'SET NEW PASSWORD'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
