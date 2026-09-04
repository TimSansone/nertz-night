'use client';

import { useEffect, useMemo, useState } from 'react';
import { Crown, Plus, RotateCcw, Sparkles, Trash2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Player = { id: string; name: string; total: number };
type RoundScore = { playerId: string; out: number; nertzLeft: number; score: number };
type Round = { id: string; scores: RoundScore[] };
const COLORS = ['#f9c74f', '#ef476f', '#59c3c3', '#8f7aea', '#f8961e', '#43aa8b'];
const DEFAULT_PLAYERS: Player[] = [
  { id: 'p1', name: 'Alex', total: 0 }, { id: 'p2', name: 'Blair', total: 0 },
  { id: 'p3', name: 'Casey', total: 0 }, { id: 'p4', name: 'Drew', total: 0 },
];

export default function Home() {
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [target, setTarget] = useState(100);
  const [outCards, setOutCards] = useState<Record<string, number>>({});
  const [nertzLeft, setNertzLeft] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nertz-scorekeeper');
    if (saved) try { const game = JSON.parse(saved); setPlayers(game.players ?? DEFAULT_PLAYERS); setRounds(game.rounds ?? []); setTarget(game.target ?? 100); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem('nertz-scorekeeper', JSON.stringify({ players, rounds, target })); }, [players, rounds, target, ready]);

  const leader = useMemo(() => [...players].sort((a, b) => b.total - a.total)[0], [players]);
  const updateNumber = (setter: React.Dispatch<React.SetStateAction<Record<string, number>>>, id: string, value: string) => setter((current) => ({ ...current, [id]: Math.max(0, Number.parseInt(value || '0', 10)) }));
  function saveRound() {
    const scores = players.map((player) => { const out = outCards[player.id] ?? 0; const left = nertzLeft[player.id] ?? 0; return { playerId: player.id, out, nertzLeft: left, score: out - left * 2 }; });
    setRounds((current) => [...current, { id: crypto.randomUUID(), scores }]);
    setPlayers((current) => current.map((player) => ({ ...player, total: player.total + (scores.find((score) => score.playerId === player.id)?.score ?? 0) })));
    setOutCards({}); setNertzLeft({});
  }
  function undoRound() {
    const last = rounds.at(-1); if (!last) return;
    setPlayers((current) => current.map((player) => ({ ...player, total: player.total - (last.scores.find((score) => score.playerId === player.id)?.score ?? 0) })));
    setRounds((current) => current.slice(0, -1));
  }
  function newGame() {
    if (!window.confirm('Start a new game? This clears every round and score.')) return;
    setPlayers((current) => current.map((player) => ({ ...player, total: 0 }))); setRounds([]); setOutCards({}); setNertzLeft({});
  }

  return <main className="min-h-screen bg-background text-foreground">
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><Sparkles size={18} /></span><span>Nertz Night</span></div>
      <div className="header-actions">
        <label className="target-control">Play to <Input aria-label="Winning score" type="number" min={1} value={target} onChange={(e) => setTarget(Math.max(1, Number(e.target.value)))} /></label>
        <Button variant="outline" className="new-game" onClick={newGame}><RotateCcw /> New game</Button>
      </div>
    </header>
    <div className="app-shell">
      <section className="workspace">
        <div className="eyebrow">Round {rounds.length + 1}</div>
        <div className="round-heading"><div><h1>Count ’em up.</h1><p>Enter each player’s cards out and cards left in their Nertz pile.</p></div><div className="formula"><span>Cards out</span><b>−</b><span>2 × Nertz left</span><b>= score</b></div></div>
        <div className="score-grid">
          {players.map((player, index) => {
            const out = outCards[player.id] ?? 0, left = nertzLeft[player.id] ?? 0, score = out - left * 2;
            return <article className="score-card" key={player.id} style={{ '--player-color': COLORS[index % COLORS.length] } as React.CSSProperties}>
              <div className="player-row"><span className="player-dot" /><Input className="player-name" aria-label={`Name for player ${index + 1}`} value={player.name} onChange={(e) => setPlayers((current) => current.map((p) => p.id === player.id ? { ...p, name: e.target.value } : p))} /><Button aria-label={`Remove ${player.name}`} title="Remove player" variant="ghost" size="icon" onClick={() => setPlayers((current) => current.filter((p) => p.id !== player.id))} disabled={players.length <= 2}><Trash2 /></Button></div>
              <div className="score-inputs"><label>Cards out<Input inputMode="numeric" type="number" min={0} value={out || ''} placeholder="0" onChange={(e) => updateNumber(setOutCards, player.id, e.target.value)} /></label><span className="math-symbol">−</span><label>Nertz left<Input inputMode="numeric" type="number" min={0} value={left || ''} placeholder="0" onChange={(e) => updateNumber(setNertzLeft, player.id, e.target.value)} /></label><span className="round-score">{score > 0 ? '+' : ''}{score}</span></div>
            </article>;
          })}
          {players.length < 8 && <button className="add-player" onClick={() => setPlayers((current) => [...current, { id: crypto.randomUUID(), name: `Player ${current.length + 1}`, total: 0 }])}><Plus /> Add player</button>}
        </div>
        <div className="save-row"><p>Scores save on this device automatically.</p><Button className="save-button" size="lg" onClick={saveRound}>Save round <span>→</span></Button></div>
      </section>
      <aside className="scoreboard">
        <div className="scoreboard-title"><div><span className="eyebrow">Game board</span><h2>Race to {target}</h2></div><Trophy /></div>
        <div className="standings">{[...players].sort((a, b) => b.total - a.total).map((player, index) => {
          const originalIndex = players.findIndex((p) => p.id === player.id), progress = Math.min(100, Math.max(0, player.total / target * 100));
          return <div className="standing" key={player.id}><div className="standing-head"><span className="rank">{index === 0 && rounds.length ? <Crown size={15} /> : index + 1}</span><span className="standing-name"><i style={{ background: COLORS[originalIndex % COLORS.length] }} />{player.name || `Player ${originalIndex + 1}`}</span><strong>{player.total}</strong></div><div className="progress"><span style={{ width: `${progress}%`, background: COLORS[originalIndex % COLORS.length] }} /></div></div>;
        })}</div>
        <div className="round-history"><div className="history-head"><h3>Round history</h3><Button variant="ghost" size="sm" onClick={undoRound} disabled={!rounds.length}><RotateCcw /> Undo</Button></div>
          {!rounds.length ? <div className="empty-history"><span>♣</span><p>Your scores will land here after round one.</p></div> : <div className="history-list">{[...rounds].reverse().map((round, reverseIndex) => <div className="history-round" key={round.id}><strong>Round {rounds.length - reverseIndex}</strong><div>{players.map((player) => { const score = round.scores.find((s) => s.playerId === player.id)?.score; return score === undefined ? null : <span key={player.id}>{player.name} <b className={score < 0 ? 'negative' : ''}>{score > 0 ? '+' : ''}{score}</b></span>; })}</div></div>)}</div>}
        </div>
        {rounds.length > 0 && leader && <div className="leader-note"><Sparkles size={16} /><span><b>{leader.name}</b> is {Math.max(0, target - leader.total)} points from the win.</span></div>}
      </aside>
    </div>
  </main>;
}
