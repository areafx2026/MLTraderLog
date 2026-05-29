import { useState, useEffect, useCallback } from 'react';
import { THEMES } from './theme.js';
import { computeStats, computeEquity } from './chartUtils.js';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import TradeList from './components/TradeList.jsx';
import TradeDetail from './components/TradeDetail.jsx';
import TradeForm from './components/TradeForm.jsx';
import Insights from './components/Insights.jsx';
import Settings from './components/Settings.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import Profile from './components/Profile.jsx';
import DeleteAccount from './components/DeleteAccount.jsx';
import LegalPage from './components/LegalPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import ConsentGate from './components/ConsentGate.jsx';
import CookieBanner from './components/CookieBanner.jsx';
import { LANG_KEY, DEFAULT_LANG, createT } from './i18n.js';

const API = '/api';
const VIEW_KEY   = 'fxlog:view';
const NAV_KEY    = 'fxlog:nav';
const TOKEN_KEY  = 'fxlog:token';
const USER_KEY   = 'fxlog:user';

function getSystemMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Returns the correct asset filenames for the current design + resolvedMode
export function getThemeAssets(design, resolvedMode) {
  const isHyper = design === 'hyper';
  const isLight = resolvedMode === 'light';
  if (isHyper && isLight) return { lockup: '/lockup-hyper-light.svg', favicon: '/favicon-hyper-light.svg' };
  if (isHyper)            return { lockup: '/lockup-hyper-dark.svg',  favicon: '/favicon-hyper-dark.svg'  };
  if (isLight)            return { lockup: '/lockup-light.svg',        favicon: '/favicon-light.svg'        };
  return                         { lockup: '/lockup-dark.svg',         favicon: '/favicon-dark.svg'         };
}

export default function App() {
  // design: 'linen' | 'hyper'
  // mode:   stored preference — 'light' | 'dark' | 'system'
  // resolvedMode: always 'light' | 'dark' (used for rendering)
  // Theme: never stored locally — default is hyper/dark, DB wins on login
  const [design, setDesign] = useState('hyper');
  const [mode, setMode]     = useState('dark');
  const [systemMode, setSystemMode] = useState(getSystemMode);
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const themeKey = `${design}-${resolvedMode}`;
  const t = THEMES[themeKey] || THEMES['linen-dark'];

  const [cookieConsent, setCookieConsent] = useState(() => localStorage.getItem('cookie_consent'));
  const [showLanding, setShowLanding] = useState(true); // false = go to auth
  const [legalNav, setLegalNav] = useState(null); // 'privacy' | 'terms' | null — works without login
  const [tradeView, setTradeView] = useState(() => localStorage.getItem(VIEW_KEY) || 'list');
  const [nav, setNav] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NAV_KEY)) || { screen: 'today', tradeId: null }; }
    catch { return { screen: 'today', tradeId: null }; }
  });
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || DEFAULT_LANG);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
    catch { return null; }
  });
  const [accountCurrency, setAccountCurrency] = useState('EUR');
  const [accountBalance, setAccountBalance] = useState(0);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const tr = createT(lang);

  // Listen for OS theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const changeLang = (l) => { setLang(l); localStorage.setItem(LANG_KEY, l); };
  const navigate = (screen, tradeId = null) => setNav({ screen, tradeId });

  const setDesignPref = useCallback((newDesign) => {
    setDesign(newDesign);
    if (token) {
      fetch(`${API}/auth/appearance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ design: newDesign, mode }),
      }).catch(() => {});
    }
  }, [token, mode]);

  const setModePref = useCallback((newMode) => {
    setMode(newMode);
    if (token) {
      fetch(`${API}/auth/appearance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ design, mode: newMode }),
      }).catch(() => {});
    }
  }, [token, design]);

  const changeView = (v) => setTradeView(v);
  useEffect(() => { localStorage.setItem(VIEW_KEY, tradeView); }, [tradeView]);
  useEffect(() => {
    try { localStorage.setItem(NAV_KEY, JSON.stringify(nav)); } catch {}
  }, [nav]);

  useEffect(() => {
    document.body.style.background = resolvedMode === 'light' ? t.paper : t.bg;
    document.body.style.color = t.ink;
    document.body.style.fontFamily = t.sans;
    document.body.style.transition = 'background .2s, color .2s';
  }, [t, resolvedMode]);

  // Update favicon dynamically when design or mode changes
  useEffect(() => {
    const { favicon } = getThemeAssets(design, resolvedMode);
    const el = document.getElementById('favicon-svg');
    if (el) el.href = favicon;
  }, [design, resolvedMode]);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, // kept for backwards compat; cookie is primary
  }), [token]);

  const authFetch = useCallback((url, opts = {}) => fetch(url, {
    ...opts,
    credentials: 'include',
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  }), [authHeaders]);

  // On startup: DB wins — load design+mode+account from server and apply
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.design) setDesign(data.design);
        if (data?.colorMode) setMode(data.colorMode);
        if (data?.accountCurrency) setAccountCurrency(data.accountCurrency);
        if (data?.accountBalance !== undefined) setAccountBalance(data.accountBalance);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On login/register: apply design+mode+account from server response
  const handleAuth = (newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    if (newUser.design) setDesign(newUser.design);
    if (newUser.colorMode) setMode(newUser.colorMode);
    if (newUser.accountCurrency) setAccountCurrency(newUser.accountCurrency);
    if (newUser.accountBalance !== undefined) setAccountBalance(newUser.accountBalance);
  };

  const handleSignOut = () => {
    fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(NAV_KEY);
    // Also clear any stale theme keys that might linger from older versions
    localStorage.removeItem('fxlog:design');
    localStorage.removeItem('fxlog:mode');
    setToken(null);
    setUser(null);
    setTrades([]);
    setNav({ screen: 'today', tradeId: null });
    setDesign('hyper');
    setMode('dark');
    setAccountCurrency('EUR');
    setAccountBalance(0);
  };

  const handle401 = () => handleSignOut();

  const fetchTrades = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/trades`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { handle401(); return; }
      const data = await res.json();
      setTrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch trades', err);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSave = async (formData) => {
    const { id, ...body } = formData;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API}/trades/${id}` : `${API}/trades`;
    try {
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      if (res.status === 401) { handle401(); return; }
      await fetchTrades();
      navigate('trades');
    } catch (err) {
      console.error('Failed to save trade', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(tr('confirm.delete_trade'))) return;
    try {
      const res = await fetch(`${API}/trades/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handle401(); return; }
      await fetchTrades();
      navigate('trades');
    } catch (err) {
      console.error('Failed to delete trade', err);
    }
  };

  useEffect(() => {
    if (token) fetchTrades();
    else setLoading(false);
  }, [token, fetchTrades]);

  // legalNav for logged-in users
  if (legalNav) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        background: resolvedMode === 'light' ? t.paper : t.bg,
        color: t.ink, fontFamily: t.sans, fontSize: 14, overflow: 'hidden',
      }}>
        <LegalPage t={t} type={legalNav} onBack={() => setLegalNav(null)} />
      </div>
    );
  }

  if (!token) {
    const handleCookieAccept = (level) => {
      localStorage.setItem('cookie_consent', level);
      setCookieConsent(level);
    };

    // 1) Consent gate — blocks everything until user makes a choice
    if (!cookieConsent) {
      return (
        <>
          {legalNav ? (
            <div style={{ width: '100vw', height: '100vh', background: resolvedMode === 'light' ? t.paper : t.bg, color: t.ink, fontFamily: t.sans, fontSize: 14, display: 'flex' }}>
              <LegalPage t={t} type={legalNav} onBack={() => setLegalNav(null)} />
            </div>
          ) : (
            <ConsentGate t={t} onAccept={handleCookieAccept} onNavigate={setLegalNav} />
          )}
        </>
      );
    }

    // 2) Legal page (from landing or auth screen links)
    if (legalNav) {
      return (
        <div style={{ width: '100vw', height: '100vh', background: resolvedMode === 'light' ? t.paper : t.bg, color: t.ink, fontFamily: t.sans, fontSize: 14, display: 'flex' }}>
          <LegalPage t={t} type={legalNav} onBack={() => setLegalNav(null)} />
        </div>
      );
    }

    // 3) Landing page
    if (showLanding) {
      return (
        <LandingPage
          t={t} design={design} resolvedMode={resolvedMode}
          onEnterApp={() => setShowLanding(false)}
          onNavigateLegal={setLegalNav}
        />
      );
    }

    // 4) Auth screen
    return (
      <>
        <AuthScreen
          t={t} onAuth={handleAuth} lang={lang}
          resolvedMode={resolvedMode} design={design} mode={mode}
          onSetDesign={setDesignPref} onSetMode={setModePref}
          onNavigateLegal={setLegalNav}
        />
      </>
    );
  }

  const stats = computeStats(trades, accountBalance);
  const equity = computeEquity(trades, accountBalance);
  const activeTrade = nav.tradeId
    ? trades.find(tr => tr.id === nav.tradeId) || null
    : null;

  let screen;
  switch (nav.screen) {
    case 'today':
      screen = (
        <Dashboard t={t} trades={trades} stats={stats} equity={equity} loading={loading}
          accountCurrency={accountCurrency} accountBalance={accountBalance}
          onNavigate={navigate} onAddTrade={() => navigate('add')} />
      );
      break;
    case 'trades':
      screen = (
        <TradeList t={t} trades={trades} view={tradeView} onChangeView={changeView}
          onNavigate={navigate} onAddTrade={() => navigate('add')} />
      );
      break;
    case 'detail':
      screen = (
        <TradeDetail t={t} trade={activeTrade}
          onBack={() => navigate('trades')}
          onEdit={(tr) => navigate('add', tr.id)}
          onDelete={handleDelete} />
      );
      break;
    case 'add':
      screen = (
        <TradeForm t={t} trade={activeTrade}
          accountCurrency={accountCurrency}
          onSave={handleSave}
          onCancel={() => navigate('trades')} />
      );
      break;
    case 'insights':
      screen = <Insights t={t} trades={trades} equity={equity} />;
      break;
    case 'profile':
      screen = (
        <Profile t={t} user={user} token={token}
          onSignOut={handleSignOut}
          onUserUpdate={(updated) => {
            setUser(updated);
            localStorage.setItem(USER_KEY, JSON.stringify(updated));
          }} />
      );
      break;
    case 'delete-account':
      screen = (
        <DeleteAccount t={t} token={token}
          onCancel={() => navigate('settings')}
          onDeleted={handleSignOut} />
      );
      break;
    case 'settings':
      screen = (
        <Settings
          t={t} resolvedMode={resolvedMode} design={design} mode={mode}
          onSetDesign={setDesignPref} onSetMode={setModePref}
          view={tradeView} onChangeView={changeView}
          user={user} onSignOut={handleSignOut} onNavigate={navigate}
          token={token} lang={lang} onChangeLang={changeLang}
          accountCurrency={accountCurrency} accountBalance={accountBalance}
          onSaveAccount={(currency, balance) => {
            setAccountCurrency(currency);
            setAccountBalance(balance);
          }}
        />
      );
      break;
    case 'privacy':
    case 'terms':
    case 'datenschutz':
      screen = <LegalPage t={t} type={nav.screen} onBack={() => navigate('today')} />;
      break;
    default:
      screen = (
        <Dashboard t={t} trades={trades} stats={stats} equity={equity} loading={loading}
          accountCurrency={accountCurrency} accountBalance={accountBalance}
          onNavigate={navigate} onAddTrade={() => navigate('add')} />
      );
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      background: resolvedMode === 'light' ? t.paper : t.bg,
      color: t.ink, fontFamily: t.sans,
      fontSize: 14, overflow: 'hidden', position: 'relative',
    }}>
      {/* Gradient blooms (Hyper only) */}
      {t.bloomViolet && (
        <>
          <div style={{
            position: 'absolute', top: -240, right: -240, width: 640, height: 640,
            borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
            background: t.bloomViolet,
          }} />
          <div style={{
            position: 'absolute', bottom: -240, left: 80, width: 560, height: 560,
            borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
            background: t.bloomCyan,
          }} />
        </>
      )}
      <Sidebar
        t={t}
        screen={nav.screen}
        onNavigate={(id) => navigate(id)}
        resolvedMode={resolvedMode}
        design={design}
        mode={mode}
        onSetDesign={setDesignPref}
        onSetMode={setModePref}
        trades={trades}
        user={user}
      />
      {screen}
      {!cookieConsent && (
        <CookieBanner t={t} onAccept={(level) => {
          localStorage.setItem('cookie_consent', level);
          setCookieConsent(level);
        }} />
      )}
    </div>
  );
}
