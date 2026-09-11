import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bot, LayoutTemplate, ShieldCheck, ChevronDown, LogOut, Settings2, Menu, X, ArrowRight } from 'lucide-react';
import { getUser, clearUser } from '../lib/store';
import { signOutRemote, backendMode } from '../lib/backend';
import { useEffect, useRef, useState } from 'react';
import BrandIcon from './BrandIcon';

function initial(name = '') {
  return (name.trim().charAt(0) || 'B').toUpperCase();
}

function avatarTone(name = '') {
  const palette = ['plum', 'blue', 'emerald', 'amber', 'rose', 'cyan', 'violet'];
  let score = 0;
  for (let i = 0; i < name.length; i += 1) score = (score * 31 + name.charCodeAt(i)) >>> 0;
  return palette[score % palette.length];
}

export default function Header() {
  const navigate = useNavigate();
  const [user, setCurrentUser] = useState(getUser());
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const sync = () => { setCurrentUser(getUser()); setAccountOpen(false); setMobileOpen(false); };
    const onPointerDown = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
    };
    window.addEventListener('boss-auth-changed', sync);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('boss-auth-changed', sync);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  const nav = [
    { to: '/websites', label: 'Websites', icon: LayoutTemplate },
    { to: '/chatbots', label: 'AI assistants', icon: Bot },
  ];

  async function logout() {
    try {
      if (backendMode === 'supabase') await signOutRemote();
    } finally {
      clearUser();
      setCurrentUser(null);
      setAccountOpen(false);
      setMobileOpen(false);
      navigate('/');
    }
  }

  const closeMobile = () => setMobileOpen(false);
  const isAdmin = user?.role === 'admin';
  const displayName = user?.name || 'My account';
  const tone = avatarTone(user?.email || displayName);

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link className="brand" to="/" onClick={closeMobile} aria-label="BOSS home">
          <span className="brand-mark"><BrandIcon size={22} /></span>
          <span>BOSS</span>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              {isAdmin ? (
                <Link className="ghost-button compact" to="/admin">
                  <ShieldCheck size={16} /> Admin workspace
                </Link>
              ) : (
                <Link className="ghost-button compact" to="/start">Build with BOSS <ArrowRight size={15}/></Link>
              )}

              <div className="account-menu" ref={accountRef}>
                <button
                  className="account-trigger account-trigger-avatar"
                  type="button"
                  aria-label="Open account menu"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountOpen(v => !v)}
                >
                  <span className={`account-letter-avatar ${tone}`} aria-hidden="true">{initial(displayName)}</span>
                </button>

                {accountOpen && (
                  <div className="account-menu-panel" role="menu">
                    <div className="account-menu-head account-menu-profile">
                      <span className={`account-letter-avatar large ${tone}`} aria-hidden="true">{initial(displayName)}</span>
                      <div>
                        <strong>{displayName}</strong>
                        <small>{user.email}</small>
                      </div>
                    </div>
                    <div className="account-menu-divider" />
                    {isAdmin ? (
                      <Link className="account-menu-item" to="/admin" onClick={() => setAccountOpen(false)}>
                        <ShieldCheck size={16} /> Admin workspace
                      </Link>
                    ) : (
                      <Link className="account-menu-item" to="/dashboard" onClick={() => setAccountOpen(false)}>
                        <Settings2 size={16} /> My dashboard
                      </Link>
                    )}
                    <button className="account-menu-item danger" type="button" onClick={logout}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link className="ghost-button compact" to="/websites">Explore</Link>
              <Link className="ghost-button compact" to="/login">Sign in</Link>
              <Link className="primary-button compact" to="/start">Start building <ArrowRight size={15}/></Link>
            </>
          )}
        </div>

        <button
          className="mobile-menu-trigger"
          type="button"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Mobile navigation">
          <nav className="mobile-menu-links">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'} onClick={closeMobile}>
                <Icon size={17} /> {label}
              </NavLink>
            ))}
            {!user && <Link className="mobile-nav-link" to="/websites" onClick={closeMobile}>Explore websites</Link>}
            {!user && <Link className="mobile-nav-link" to="/start" onClick={closeMobile}>Start building <ArrowRight size={15}/></Link>}
            {!user && <Link className="mobile-nav-link" to="/login" onClick={closeMobile}>Sign in</Link>}
            {user && !isAdmin && <Link className="mobile-nav-link" to="/start" onClick={closeMobile}>Build with BOSS <ArrowRight size={15}/></Link>}
            {user && isAdmin && <Link className="mobile-nav-link" to="/admin" onClick={closeMobile}><ShieldCheck size={17} /> Admin workspace</Link>}
            {user && <button className="mobile-nav-link danger" type="button" onClick={logout}><LogOut size={17} /> Sign out</button>}
          </nav>
        </div>
      )}
    </header>
  );
}
