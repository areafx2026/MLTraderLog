import { useState, useEffect } from 'react';
import TradeList from './components/TradeList.jsx';
import TradeForm from './components/TradeForm.jsx';
import TradeStats from './components/TradeStats.jsx';
import TradeDetail from './components/TradeDetail.jsx';
import './App.css';

const API = '/api';

export default function App() {
  const [view, setView] = useState('list'); // list | new | stats | detail
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [editTrade, setEditTrade] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTrades = async () => {
    const res = await fetch(`${API}/trades`);
    const data = await res.json();
    setTrades(data);
    setLoading(false);
  };

  const fetchStats = async () => {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    fetchTrades();
    fetchStats();
  }, []);

  const handleSave = async (tradeData, id) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API}/trades/${id}` : `${API}/trades`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeData),
    });
    await fetchTrades();
    await fetchStats();
    setEditTrade(null);
    setView('list');
  };

  const handleDelete = async (id) => {
    if (!confirm('Trade löschen?')) return;
    await fetch(`${API}/trades/${id}`, { method: 'DELETE' });
    await fetchTrades();
    await fetchStats();
    setSelectedTrade(null);
    setView('list');
  };

  const openDetail = (trade) => {
    setSelectedTrade(trade);
    setView('detail');
  };

  const openEdit = (trade) => {
    setEditTrade(trade);
    setView('new');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="logo">ML<span>TL</span></span>
          <span className="logo-sub">TraderLog</span>
        </div>
        <nav className="header-nav">
          <button
            className={view === 'list' || view === 'detail' ? 'active' : ''}
            onClick={() => { setView('list'); setSelectedTrade(null); setEditTrade(null); }}
          >Journal</button>
          <button
            className={view === 'stats' ? 'active' : ''}
            onClick={() => setView('stats')}
          >Statistik</button>
        </nav>
        <button className="btn-primary new-btn" onClick={() => { setEditTrade(null); setView('new'); }}>
          + Neuer Trade
        </button>
      </header>

      <main className="app-main">
        {loading && <div className="loading">Lade Trades…</div>}

        {!loading && view === 'list' && (
          <TradeList trades={trades} onSelect={openDetail} />
        )}

        {view === 'new' && (
          <TradeForm
            initial={editTrade}
            onSave={handleSave}
            onCancel={() => { setEditTrade(null); setView('list'); }}
          />
        )}

        {view === 'stats' && stats && (
          <TradeStats stats={stats} trades={trades} />
        )}

        {view === 'detail' && selectedTrade && (
          <TradeDetail
            trade={selectedTrade}
            onEdit={openEdit}
            onDelete={handleDelete}
            onBack={() => setView('list')}
          />
        )}
      </main>
    </div>
  );
}
