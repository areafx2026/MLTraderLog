import { useState, useEffect, useCallback } from 'react';
import { THEMES, FONTS } from './theme.js';
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
import { LANG_KEY, DEFAULT_LANG, createT } from './i18n.js';

const API = '/api';
const MODE_KEY  = 'fxlog:mode';
const VIEW_KEY  = 'fxlog:view';
const NAV_KEY   = 'fxlog:nav';
const TOKEN_KEY = 'fxlog:token';
const USER_KEY  = 'fxlog:user';

function getSystemMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  // theme = stored preference: 'dark' | 'light' | 'system'
  // mode  = resolved for rendering: always 'dark' or 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem(MODE_KEY) || 'dark');
  const [systemMode, setSystemMode] = useState(getSystemMode);
  const mode = theme === 'system' ? systemMode : theme;

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
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = THEMES[mode] || THEMES.dark;
  const tr = createT(lang);

  // Listen for OS theme changes (only matters when theme === 'system')
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const changeLang = (l) => { setLang(l); localStorage.setItem(LANG_KEY, l); };
  const navigate = (screen, tradeId = null) => setNav({ screen, tradeId });

  // setThemePref: saves preference, syncs to DB if logged in
  const setThemePref = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem(MODE_KEY, newTheme);
    if (token) {
      fetch(`${API}/auth/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ theme: newTheme }),
      }).catch(() => {});
    }
  }, [token]);

  const changeView = (v) => setTradeView(v);
  useEffect(() => { localStorage.setItem(VIEW_KEY, tradeView); }, [tradeView]);
  useEffect(() => {
    try { localStorage.setItem(NAV_KEY, JSON.stringify(nav)); } catch {}
  }, [nav]);

  useEffect(() => {
    document.body.style.background = mode === 'dark' ? t.bg : t.paper;
    document.body.style.color = t.ink;
    document.body.style.fontFamily = FONTS.sans;
    document.body.style.transition = 'background .2s, color .2s';
  }, [t]);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  // On startup: DB wins — load theme from server and apply it
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.theme) {
          setTheme(data.theme);
          localStorage.setItem(MODE_KEY, data.theme);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On login/register: DB wins — apply theme from server response
  const handleAuth = (newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    if (newUser.theme) {
      setTheme(newUser.theme);
      localStorage.setItem(MODE_KEY, newUser.theme);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(NAV_KEY);
    setToken(null);
    setUser(null);
    setTrades([]);
    setNav({ screen: 'today', tradeId: null });
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

  if (!token) {
    return <AuthScreen t={t} onAuth={handleAuth} lang={lang} mode={mode} theme={theme} onSetTheme={setThemePref} />;
  }

  const stats = computeStats(trades);
  const equity = computeEquity(trades);
  const activeTrade = nav.tradeId
    ? trades.find(tr => tr.id === nav.tradeId) || null
    : null;

  let screen;
  switch (nav.screen) {
    case 'today':
      screen = (
        <Dashboard t={t} trades={trades} stats={stats} equity={equity} loading={loading}
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
          onUserUpdate={(updated) => {
            setUser(updated);
            localStorage.setItem(USER_KEY, JSON.stringify(updated));
          }} />
      );
      break;
    case 'settings':
      screen = (
        <Settings t={t} mode={mode} theme={theme} onSetTheme={setThemePref}
          view={tradeView} onChangeView={changeView}
          user={user} onSignOut={handleSignOut}
          token={token} lang={lang} onChangeLang={changeLang} />
      );
      break;
    default:
      screen = (
        <Dashboard t={t} trades={trades} stats={stats} equity={equity} loading={loading}
          onNavigate={navigate} onAddTrade={() => navigate('add')} />
      );
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      background: mode === 'dark' ? t.bg : t.paper, color: t.ink, fontFamily: FONTS.sans,
      fontSize: 14, overflow: 'hidden',
    }}>
      <Sidebar
        t={t}
        screen={nav.screen}
        onNavigate={(id) => navigate(id)}
        mode={mode}
        theme={theme}
        onSetTheme={setThemePref}
        trades={trades}
        user={user}
      />
      {screen}
    </div>
  );
}
