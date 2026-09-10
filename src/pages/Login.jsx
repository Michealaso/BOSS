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
          setNotice('Account created. Check your email if Supabase email confirmation is enabled.');
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
      setError('Password reset is available after Supabase authentication is connected.');
      return;
    }
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setBusy(true);
    try {
      await resetPasswordForEmail(email.trim());
      setNotice('Password reset instructions were sent. Check your email.');
    } catch (err) {
      setError(err.message || 'Unable to send reset instructions.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container page-section narrow">
      <div className="auth-card">
        <div className="auth-logo">{recovery ? <KeyRound /> : <LockKeyhole />}</div>
        <div className="eyebrow">{recovery ? 'Password recovery' : backendMode === 'supabase' ? 'Secure account' : 'Local mode'}</div>
        <h1>{recovery ? 'Choose a new password.' : mode === 'signin' ? 'Sign in to BOSS.' : 'Create your BOSS account.'}</h1>
        <p>{recovery ? 'Set a new password for your BOSS account.' : backendMode === 'supabase' ? 'Use your real account credentials.' : 'Local account mode is for interface testing.'}</p>

        <form onSubmit={submit}>
          {recovery ? (
            <label>New password<input required minLength="6" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" /></label>
          ) : (
            <>
              {mode === 'signup' && <label>Name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></label>}
              <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
              {backendMode === 'supabase' && <label>Password<input required minLength="6" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></label>}
            </>
          )}
          <button className="primary-button large full" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : recovery ? 'Update password' : mode === 'signin' ? 'Continue' : 'Create account'}
            {!busy && <ArrowRight size={17} />}
          </button>
        </form>

        {error && <div className="error-box">{error}</div>}
        {notice && <div className="success-box"><MailCheck size={16} />{notice}</div>}

        {!recovery && mode === 'signin' && backendMode === 'supabase' && (
          <button type="button" className="forgot-link" onClick={forgotPassword} disabled={busy}>Forgot password?</button>
        )}
        {!recovery && (
          <button type="button" className="text-link as-button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice(''); }}>
            {mode === 'signin' ? 'Create an account' : 'Already have an account? Sign in'}
          </button>
        )}
        <div className="small-note"><ShieldCheck size={15} /> {backendMode === 'supabase' ? 'Real Supabase authentication is enabled.' : 'Local mode is for interface testing only.'}</div>
        <Link className="text-link" to="/">Back to homepage</Link>
      </div>
    </section>
  );
}
