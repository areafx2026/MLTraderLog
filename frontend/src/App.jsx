import { useState, useEffect } from 'react';
import { THEMES, FONTS } from './theme.js';
import { computeStats, computeEquity } from './chartUtils.js';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import TradeList from './components/TradeList.jsx';
import TradeDetail from './components/TradeDetail.jsx';
import TradeForm from './components/TradeForm.jsx';
import Insights from './components/Insights.jsx';
import Settings from './components/Settings.jsx';

const API = '/api';
const MODE_KEY = 'fxlog:mode';
const VIEW_KEY = 'fxlog:view';
const NAV_KEY  = 'fxlog:nav';

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || 'light');
  const [tradeView, setTradeView] = useState(() => localStorage.getItem(VIEW_KEY) || 'list');
  const [nav, setNav] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NAV_KEY)) || { screen: 'today', tradeId: null }; }
    catch { return { screen: 'today', tradeId: null }; }
  });
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = THEMES[mode] || THEMES.light;

  const navigate = (screen, tradeId = null) => setNav({ screen, tradeId });

  const toggleMode = (m) => setMode(typeof m === 'string' ? m : (prev => prev === 'light' ? 'dark' : 'light'));
  const changeView = (v) => setTradeView(v);

  useEffect(() => { localStorage.setItem(MODE_KEY, mode); }, [mode]);
  useEffect(() => { localStorage.setItem(VIEW_KEY, tradeView); }, [tradeView]);
  useEffect(() => {
    try { localStorage.setItem(NAV_KEY, JSON.stringify(nav)); } catch {}
  }, [nav]);

  useEffect(() => {
    document.body.style.background = t.bg;
    document.body.style.color = t.ink;
    document.body.style.fontFamily = FONTS.sans;
    document.body.style.transition = 'background .2s, color .2s';
  }, [t]);

  const fetchTrades = async () => {
    try {
      const res = await fetch(`${API}/trades`);
      const data = await res.json();
      setTrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch trades', err);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    const { id, ...body } = formData;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API}/trades/${id}` : `${API}/trades`;
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await fetchTrades();
      navigate('trades');
    } catch (err) {
      console.error('Failed to save trade', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Diesen Trade löschen?')) return;
    try {
      await fetch(`${API}/trades/${id}`, { method: 'DELETE' });
      await fetchTrades();
      navigate('trades');
    } catch (err) {
      console.error('Failed to delete trade', err);
    }
  };

  useEffect(() => { fetchTrades(); }, []);

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
    case 'settings':
      screen = (
        <Settings t={t} mode={mode} onToggleMode={toggleMode}
          view={tradeView} onChangeView={changeView} />
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
      background: t.bg, color: t.ink, fontFamily: FONTS.sans,
      fontSize: 14, overflow: 'hidden',
    }}>
      <Sidebar
        t={t}
        screen={nav.screen}
        onNavigate={(id) => navigate(id)}
        mode={mode}
        onToggleMode={toggleMode}
        trades={trades}
      />
      {screen}
    </div>
  );
}
