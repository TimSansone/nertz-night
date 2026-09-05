export function calculateRoundScore(cardsOut: number, cardsLeft: number) {
  return cardsOut - cardsLeft;
}

type SavedRound = { id: string; scores: { playerId: string; out: number; nertzLeft: number; score: number }[] };
type SavedPlayer = { id: string; name: string; total: number };

export function recalculateGame(players: SavedPlayer[], rounds: SavedRound[]) {
  const correctedRounds = rounds.map((round) => ({
    ...round,
    scores: round.scores.map((score) => ({
      ...score,
      score: calculateRoundScore(score.out, score.nertzLeft),
    })),
  }));
  const correctedPlayers = players.map((player) => ({
    ...player,
    total: correctedRounds.reduce((total, round) =>
      total + (round.scores.find((score) => score.playerId === player.id)?.score ?? 0), 0),
  }));
  return { players: correctedPlayers, rounds: correctedRounds };
}
