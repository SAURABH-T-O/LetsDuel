export function getRoundNames(bracketSize) {
  if (bracketSize === 4) return ['Semifinals', 'Final'];
  if (bracketSize === 8) return ['Quarterfinals', 'Semifinals', 'Final'];
  if (bracketSize === 16) return ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
  return ['Round 1', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
}

export function shuffleList(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

export function isValidSingleEliminationCount(participantCount, bracketSize) {
  return participantCount === bracketSize || participantCount === bracketSize - 1;
}

export function generateSingleEliminationTournament(participants, bracketSize) {
  const shuffled = shuffleList(participants);
  const hasBye = participants.length === bracketSize - 1;
  const byePlayer = hasBye ? shuffled.splice(Math.floor(Math.random() * shuffled.length), 1)[0] : null;
  const slots = [...shuffled];

  if (byePlayer) {
    const byePairIndex = Math.floor(Math.random() * (bracketSize / 2));
    slots.splice(byePairIndex * 2, 0, byePlayer, 'BYE');
  }

  while (slots.length < bracketSize) slots.push(null);

  const roundNames = getRoundNames(bracketSize);
  const rounds = roundNames.map((name, roundIndex) => {
    const matchCount = bracketSize / 2 ** (roundIndex + 1);
    return {
      id: `round-${roundIndex + 1}`,
      name,
      matches: Array.from({ length: matchCount }, (_, matchIndex) => ({
        id: `r${roundIndex + 1}-m${matchIndex + 1}`,
        round: roundIndex + 1,
        player1: null,
        player2: null,
        score1: 0,
        score2: 0,
        status: 'upcoming',
        winner: null,
        loser: null,
        isBye: false,
        nextMatchId: roundIndex < roundNames.length - 1 ? `r${roundIndex + 2}-m${Math.floor(matchIndex / 2) + 1}` : null,
        nextSlot: matchIndex % 2 === 0 ? 'player1' : 'player2',
        previousMatchIds: [],
      })),
    };
  });

  rounds[0].matches = rounds[0].matches.map((match, index) => {
    const player1 = slots[index * 2];
    const player2 = slots[index * 2 + 1];
    const isBye = player1 === 'BYE' || player2 === 'BYE';
    const winner = isBye ? (player1 === 'BYE' ? player2 : player1) : null;

    return {
      ...match,
      player1,
      player2,
      winner,
      loser: isBye ? 'BYE' : null,
      isBye,
      status: isBye ? 'bye' : player1 && player2 ? 'active' : 'upcoming',
    };
  });

  rounds.forEach((round, roundIndex) => {
    if (roundIndex === 0) return;
    round.matches = round.matches.map((match, matchIndex) => ({
      ...match,
      previousMatchIds: [
        `r${roundIndex}-m${matchIndex * 2 + 1}`,
        `r${roundIndex}-m${matchIndex * 2 + 2}`,
      ],
    }));
  });

  rounds[0].matches.forEach((match) => {
    if (!match.isBye || !match.nextMatchId) return;
    const nextRound = rounds[match.round];
    const nextMatch = nextRound.matches.find((item) => item.id === match.nextMatchId);
    if (nextMatch) nextMatch[match.nextSlot] = match.winner;
  });

  return { bracketSize, participantCount: participants.length, rounds, champion: null, frozen: true };
}

export function completeTournamentMatch(tournament, matchId, winner) {
  const rounds = tournament.rounds.map((round) => ({
    ...round,
    matches: round.matches.map((match) => ({ ...match })),
  }));

  let completedMatch;

  rounds.forEach((round) => {
    round.matches = round.matches.map((match) => {
      if (match.id !== matchId) return match;
      const loser = match.player1 === winner ? match.player2 : match.player1;
      completedMatch = { ...match, winner, loser, status: 'completed', score1: match.player1 === winner ? 1 : 0, score2: match.player2 === winner ? 1 : 0 };
      return completedMatch;
    });
  });

  if (completedMatch?.nextMatchId) {
    rounds.forEach((round) => {
      round.matches = round.matches.map((match) => {
        if (match.id !== completedMatch.nextMatchId) return match;
        const nextMatch = { ...match, [completedMatch.nextSlot]: winner };
        if (nextMatch.player1 && nextMatch.player2 && nextMatch.player1 !== 'BYE' && nextMatch.player2 !== 'BYE') {
          nextMatch.status = 'active';
        }
        return nextMatch;
      });
    });
  }

  const finalRound = rounds[rounds.length - 1];
  const finalMatch = finalRound.matches[0];
  const champion = finalMatch?.status === 'completed' ? finalMatch.winner : tournament.champion;

  return { ...tournament, rounds, champion };
}
