import { CardData, CardType, Team } from '../types';
import { FIGHTER_NAMES, GRID_SIZE, ASSASSIN_COUNT } from '../constants/fighters';

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const initializeBoard = (): { cards: CardData[], startingTeam: Team, redAgentCount: number, blueAgentCount: number } => {
  const shuffledFighters = shuffleArray(FIGHTER_NAMES);
  const selectedFighters = shuffledFighters.slice(0, GRID_SIZE);

  const cards: CardData[] = [];

  const startingTeam = Math.random() < 0.5 ? Team.RED : Team.BLUE;
  const redAgentCount = startingTeam === Team.RED ? 9 : 8;
  const blueAgentCount = startingTeam === Team.BLUE ? 9 : 8;
  const neutralAgentCount = GRID_SIZE - redAgentCount - blueAgentCount - ASSASSIN_COUNT;

  let types: CardType[] = [];
  for (let i = 0; i < redAgentCount; i++) types.push(CardType.RED_AGENT);
  for (let i = 0; i < blueAgentCount; i++) types.push(CardType.BLUE_AGENT);
  for (let i = 0; i < ASSASSIN_COUNT; i++) types.push(CardType.ASSASSIN);
  for (let i = 0; i < neutralAgentCount; i++) types.push(CardType.NEUTRAL);

  types = shuffleArray(types);

  selectedFighters.forEach((fighter, index) => {
    cards.push({
      id: fighter,
      word: fighter,
      type: types[index],
      revealed: false,
    });
  });

  return { cards: shuffleArray(cards), startingTeam, redAgentCount, blueAgentCount };
};
