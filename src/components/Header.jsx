import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bot, LayoutTemplate, UserCircle, ShieldCheck, ChevronDown, LogOut, Settings2 } from 'lucide-react';
import { getUser, clearUser } from '../lib/store';
import { signOutRemote, backendMode } from '../lib/backend';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const [user, setCurrentUser] = useState(getUser());
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const sync = () => { setCurrentUser(getUser()); setAccountOpen(false); };
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
    { to: '/chatbots', label: 'Chatbots', icon: Bot },
  ];

  async function logout() {
    try {
      if (backendMode === 'supabase') await signOutRemote();
    } finally {
      clearUser();
      setCurrentUser(null);
      setAccountOpen(false);
      navigate('/');
    }
  }

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link className="brand" to="/">
          <span className="brand-mark"><Bot size={19} /></span>
          <span>BOSS</span>
        </Link>

        <nav className="nav-links">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link className="ghost-button compact admin-nav-badge" to="/admin">
                  <ShieldCheck size={16} /> Admin
                </Link>
              ) : (
                <Link className="ghost-button compact" to="/start">Build with BOSS <span aria-hidden="true">→</span></Link>
              )}

              <div className="account-menu" ref={accountRef}>
                <button className="account-trigger" type="button" aria-expanded={accountOpen} aria-haspopup="menu" onClick={() => setAccountOpen(v => !v)}>
                  <span className="account-avatar"><UserCircle size={19} /></span>
                  <span className="account-trigger-copy">
                    <strong>{user.name || 'My account'}</strong>
                    <small>{user.role === 'admin' ? 'Administrator' : 'Customer'}</small>
                  </span>
                  <ChevronDown className={accountOpen ? 'account-chevron open' : 'account-chevron'} size={16} />
                </button>

                {accountOpen && (
                  <div className="account-menu-panel" role="menu">
                    <div className="account-menu-head">
                      <span className="account-avatar large"><UserCircle size={20} /></span>
                      <div>
                        <strong>{user.name || 'My account'}</strong>
                        <small>{user.email}</small>
                      </div>
                    </div>
                    <div className="account-menu-divider" />
                    {user.role === 'admin' ? (
                      <Link className="account-menu-item" to="/admin" onClick={() => setAccountOpen(false)}>
                        <ShieldCheck size={16} /> Admin dashboard
                      </Link>
                    ) : (
                      <Link className="account-menu-item" to="/dashboard" onClick={() => setAccountOpen(false)}>
                        <Settings2 size={16} /> My account
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
              <Link className="ghost-button compact" to="/start">Start building</Link>
              <Link className="ghost-button compact" to="/login"><UserCircle size={17} /> Sign in</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
