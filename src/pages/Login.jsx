import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, ShieldCheck, KeyRound, MailCheck } from 'lucide-react';
import { backendMode, signInWithPassword, signUpWithPassword, getRemoteProfile, toLocalUser, resetPasswordForEmail, updatePassword } from '../lib/backend';
import { setUser } from '../lib/store';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (backendMode !== 'supabase') return;
    const onHash = () => {
      if (window.location.hash.includes('type=recovery')) setRecovery(true);
    };
    onHash();
    const handler = (event) => {
      if (event.detail?.event === 'PASSWORD_RECOVERY') setRecovery(true);
    };
    window.addEventListener('boss-password-recovery', handler);
    return () => window.removeEventListener('boss-password-recovery', handler);
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (recovery) {
        if (newPassword.length < 6) throw new Error('Use a password with at least 6 characters.');
        await updatePassword(newPassword);
        setRecovery(false);
        setNewPassword('');
        setMode('signin');
        setNotice('Your password has been updated. You can sign in now.');
        return;
      }

      if (backendMode === 'supabase') {
        const data = mode === 'signup'
          ? await signUpWithPassword(email, password, { name })
          : await signInWithPassword(email, password);
        if (!data?.session) {
          setNotice('Account created. Check your email to finish setting up your account.');
          return;
        }
        const profile = await getRemoteProfile(data.user.id);
        const local = toLocalUser(data.user, profile);
        setUser(local);
        window.dispatchEvent(new Event('boss-auth-changed'));
        let pendingBuild = null;
        try {
          const raw = sessionStorage.getItem('boss_pending_build');
          if (raw) pendingBuild = JSON.parse(raw);
        } catch {}
        const resumeState = pendingBuild ? { state: { wizardData: pendingBuild } } : undefined;
        if (pendingBuild) { try { sessionStorage.removeItem('boss_pending_build'); } catch {} }
        navigate(local.role === 'admin' ? '/admin' : pendingBuild ? '/start' : '/dashboard', resumeState);
      } else {
        setUser({ name: name || 'Customer', email, role: 'customer' });
        window.dispatchEvent(new Event('boss-auth-changed'));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Unable to continue.');
    } finally {
      setBusy(false);
    }
  }

  async function forgotPassword() {
    setError('');
    setNotice('');
    if (backendMode !== 'supabase') {
      setError('Password reset is currently unavailable.');
      return;
    }
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setBusy(true);
    try {
      await resetPasswordForEmail(email.trim());
      setNotice('If an account matches that email, password reset instructions have been sent.');
    } catch {
      setNotice('If an account matches that email, password reset instructions have been sent.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container page-section auth-page">
      <div className="auth-layout">
        <div className="auth-intro">
          <div className="auth-kicker"><span className="auth-kicker-dot" /> Your BOSS workspace</div>
          <h1>{recovery ? 'Set a new password and get back to work.' : mode === 'signin' ? 'Welcome back.' : 'Start your BOSS workspace.'}</h1>
          <p>{recovery ? 'Choose a new password for your account.' : mode === 'signin' ? 'Sign in to manage your builds, orders and business projects.' : 'Create your account and keep your business setup in one place.'}</p>
          <div className="auth-points">
            <span><ShieldCheck size={16} /> Secure account access</span>
            <span><ShieldCheck size={16} /> Your workspace stays yours</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-top">
            <div className="auth-logo">{recovery ? <KeyRound /> : <LockKeyhole />}</div>
            <div>
              <div className="eyebrow">{recovery ? 'Password recovery' : mode === 'signin' ? 'Sign in' : 'Create account'}</div>
              <h2>{recovery ? 'Create a new password' : mode === 'signin' ? 'Access your account' : 'Create your account'}</h2>
            </div>
          </div>

          <form onSubmit={submit}>
            {recovery ? (
              <label>New password<input required minLength="6" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter a new password" autoComplete="new-password" /></label>
            ) : (
              <>
                {mode === 'signup' && <label>Name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" /></label>}
                <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
                <label>Password<input required minLength="6" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} /></label>
              </>
            )}
            <button className="primary-button large full auth-submit" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : recovery ? 'Update password' : mode === 'signin' ? 'Sign in' : 'Create account'}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>

          {error && <div className="error-box" role="alert">{error}</div>}
          {notice && <div className="success-box" role="status"><MailCheck size={16} />{notice}</div>}

          {!recovery && mode === 'signin' && (
            <button type="button" className="forgot-link" onClick={forgotPassword} disabled={busy}>Forgot password?</button>
          )}
          {!recovery && (
            <button type="button" className="text-link as-button auth-switch" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice(''); }}>
              {mode === 'signin' ? 'Create an account' : 'Already have an account? Sign in'}
            </button>
          )}
          <div className="auth-assurance"><ShieldCheck size={15} /> Protected account access</div>
          <Link className="text-link" to="/">Back to homepage</Link>
        </div>
      </div>
    </section>
  );
}
