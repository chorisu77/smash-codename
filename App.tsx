
import React, { useState, useEffect, useCallback } from 'react';
import { CardData, Team, CardType, Clue, GamePhase, Player, LogEntry, LogEntryType } from './types';
import { initializeBoard } from './utils/gameLogic';
// generateThematicIntro is no longer used for display, but service can remain for other potential uses
// import { generateThematicIntro } from './services/geminiService'; 
// generateGameOverSummary is no longer used in GameOverModal
// import { generateGameOverSummary } from './services/geminiService';
import Board from './components/Board';
import Scoreboard from './components/Scoreboard';
import ClueInput from './components/ClueInput';
import GameOverModal from './components/GameOverModal';
import Header from './components/Header';
import PlayerSetup from './components/PlayerSetup';
import GameLog from './components/GameLog'; // New component

const App: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.PLAYER_SETUP);
  const [cards, setCards] = useState<CardData[]>([]);
  const [startingTeam, setStartingTeam] = useState<Team>(Team.RED);
  const [initialRedAgentCount, setInitialRedAgentCount] = useState(0);
  const [initialBlueAgentCount, setInitialBlueAgentCount] = useState(0);
  const [redAgentsLeft, setRedAgentsLeft] = useState(0);
  const [blueAgentsLeft, setBlueAgentsLeft] = useState(0);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const [guessesMadeThisTurn, setGuessesMadeThisTurn] = useState(0);
  const [maxGuessesAllowedForClue, setMaxGuessesAllowedForClue] = useState(0);
  const [winner, setWinner] = useState<Team | null>(null);
  // winningReason is now simplified or derived for logging, not detailed display
  // const [winningReason, setWinningReason] = useState<string>(''); 
  const [assassinHitBy, setAssassinHitBy] = useState<Team | null>(null);
  const [isSpymasterView, setIsSpymasterView] = useState(false);
  // gameIntroMessage state is no longer used for display
  // const [gameIntroMessage, setGameIntroMessage] = useState<string | null>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false); // Renamed from isLoadingIntro

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  // Gemini summary is no longer displayed in the modal
  // const [geminiGameOverSummary, setGeminiGameOverSummary] = useState<string | null>(null);
  // const [isLoadingGeminiSummary, setIsLoadingGeminiSummary] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [nextPlayerId, setNextPlayerId] = useState(1);
  const [gameLog, setGameLog] = useState<LogEntry[]>([]);

  const addLogEntry = useCallback((logData: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...logData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setGameLog(prevLog => [...prevLog, newEntry]);
  }, []);

  const handleAddPlayer = (name: string) => {
    setPlayers(prev => [...prev, { id: nextPlayerId.toString(), name, team: null, isSpymaster: false }]);
    setNextPlayerId(id => id + 1);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const handleSetPlayerTeam = (id: string, team: Team | null) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, team, isSpymaster: team === null ? false : p.isSpymaster && p.team === team };
      }
      return p;
    }));
  };

  const handleSetSpymaster = (id: string, team: Team) => {
    setPlayers(prev => prev.map(p => {
      if (p.team === team) {
        return { ...p, isSpymaster: p.id === id };
      }
      return p;
    }));
  };
  
  const handleStartGameSetup = () => {
    setGamePhase(GamePhase.BOARD_INITIALIZATION);
  };

  // fetchGeminiGameOverSummary is no longer needed for the simplified modal
  /*
  const fetchGeminiGameOverSummary = useCallback(async (
    currentWinner: Team | null,
    currentAssassinHitBy: Team | null,
    currentWinningReason: string
  ) => {
    // ... implementation ...
  }, []);
  */

  const initializeNewGameBoard = useCallback(async () => {
    setIsLoadingBoard(true);
    setGameLog([]); // Clear log for new game
    const { cards: newCards, startingTeam: newStartingTeam, redAgentCount, blueAgentCount } = initializeBoard();
    setCards(newCards);
    setStartingTeam(newStartingTeam);
    setInitialRedAgentCount(redAgentCount);
    setInitialBlueAgentCount(blueAgentCount);
    setRedAgentsLeft(redAgentCount);
    setBlueAgentsLeft(blueAgentCount);
    setCurrentClue(null);
    setGuessesMadeThisTurn(0);
    setMaxGuessesAllowedForClue(0);
    setWinner(null);
    setAssassinHitBy(null);
    setIsSpymasterView(false); 
    setShowGameOverModal(false);
    
    addLogEntry({
      type: LogEntryType.GAME_START,
      team: newStartingTeam,
      message: `新しいゲームが開始されました。`,
    });
    
    setGamePhase(newStartingTeam === Team.RED ? GamePhase.RED_SPYMASTER_CLUE : GamePhase.BLUE_SPYMASTER_CLUE);
    
    // Thematic intro message is no longer fetched for display
    /*
    const opponentTeam = newStartingTeam === Team.RED ? Team.BLUE : Team.RED;
    try {
      // const intro = await generateThematicIntro(newStartingTeam.toString(), opponentTeam.toString());
      // setGameIntroMessage(intro);
    } catch (e) {
      // setGameIntroMessage(`ようこそ！ ${newStartingTeam} チームが先攻です。頑張ってください！`);
    } finally {
      setIsLoadingBoard(false);
    }
    */
    setIsLoadingBoard(false);
  }, [addLogEntry]); 

  useEffect(() => {
    if (gamePhase === GamePhase.BOARD_INITIALIZATION) {
      initializeNewGameBoard();
    }
  }, [gamePhase, initializeNewGameBoard]);

  useEffect(() => {
    if (gamePhase === GamePhase.GAME_OVER && (winner !== null || assassinHitBy !== null)) {
      setShowGameOverModal(true);
      // No longer fetching Gemini summary for modal
      // fetchGeminiGameOverSummary(winner, assassinHitBy, winningReason); 
    }
  }, [gamePhase, winner, assassinHitBy /*, winningReason, fetchGeminiGameOverSummary*/]);


  const handleToggleSpymasterView = () => {
    setIsSpymasterView(prev => !prev);
  };

  const endTurn = useCallback((manualEnd: boolean = false, reason?: string) => {
    const currentTeam = (gamePhase === GamePhase.RED_OPERATIVE_GUESS || gamePhase === GamePhase.RED_SPYMASTER_CLUE) ? Team.RED : Team.BLUE;
    
    if (manualEnd) {
        addLogEntry({ type: LogEntryType.TURN_ENDED_MANUALLY, team: currentTeam });
    } else {
        addLogEntry({ type: LogEntryType.TURN_ENDED_AUTOMATICALLY, team: currentTeam, message: reason });
    }

    setCurrentClue(null);
    setGuessesMadeThisTurn(0);
    setMaxGuessesAllowedForClue(0);
    if (gamePhase === GamePhase.RED_OPERATIVE_GUESS) {
      setGamePhase(GamePhase.BLUE_SPYMASTER_CLUE);
    } else if (gamePhase === GamePhase.BLUE_OPERATIVE_GUESS) {
      setGamePhase(GamePhase.RED_SPYMASTER_CLUE);
    }
  }, [gamePhase, addLogEntry]);

  const handleCardClick = useCallback((cardId: string) => {
    if (gamePhase !== GamePhase.RED_OPERATIVE_GUESS && gamePhase !== GamePhase.BLUE_OPERATIVE_GUESS) return;

    const clickedCardIndex = cards.findIndex(c => c.id === cardId);
    if (clickedCardIndex === -1) return;

    const clickedCard = cards[clickedCardIndex];
    if (clickedCard.revealed) return;

    const currentTurnTeam = (gamePhase === GamePhase.RED_OPERATIVE_GUESS) ? Team.RED : Team.BLUE;
    const opponentTeam = currentTurnTeam === Team.RED ? Team.BLUE : Team.RED;
    
    const newCards = [...cards];
    newCards[clickedCardIndex] = { ...clickedCard, revealed: true, revealedBy: currentTurnTeam };
    setCards(newCards);

    let newRedAgentsLeft = redAgentsLeft;
    let newBlueAgentsLeft = blueAgentsLeft;
    let turnOver = false;
    let turnEndReason = "";

    setGuessesMadeThisTurn(prev => prev + 1);
    const guessesAfterThisOne = guessesMadeThisTurn + 1;

    switch (clickedCard.type) {
      case CardType.RED_AGENT:
        newRedAgentsLeft--;
        setRedAgentsLeft(newRedAgentsLeft);
        addLogEntry({ type: LogEntryType.CORRECT_GUESS, team: currentTurnTeam, guessedCardWord: clickedCard.word, guessedCardType: clickedCard.type });
        if (currentTurnTeam === Team.BLUE) {
          turnOver = true;
          turnEndReason = "相手チームのエージェントを選択";
          addLogEntry({ type: LogEntryType.OPPONENT_GUESS, team: currentTurnTeam, guessedCardWord: clickedCard.word, guessedCardType: clickedCard.type });
        }
        break;
      case CardType.BLUE_AGENT:
        newBlueAgentsLeft--;
        setBlueAgentsLeft(newBlueAgentsLeft);
        addLogEntry({ type: LogEntryType.CORRECT_GUESS, team: currentTurnTeam, guessedCardWord: clickedCard.word, guessedCardType: clickedCard.type });
        if (currentTurnTeam === Team.RED) {
          turnOver = true;
          turnEndReason = "相手チームのエージェントを選択";
          addLogEntry({ type: LogEntryType.OPPONENT_GUESS, team: currentTurnTeam, guessedCardWord: clickedCard.word, guessedCardType: clickedCard.type });
        }
        break;
      case CardType.NEUTRAL:
        addLogEntry({ type: LogEntryType.NEUTRAL_GUESS, team: currentTurnTeam, guessedCardWord: clickedCard.word, guessedCardType: clickedCard.type });
        turnOver = true;
        turnEndReason = "中立のエージェントを選択";
        break;
      case CardType.ASSASSIN:
        addLogEntry({ type: LogEntryType.ASSASSIN_GUESS, team: currentTurnTeam, guessedCardWord: clickedCard.word, guessedCardType: clickedCard.type });
        setGamePhase(GamePhase.GAME_OVER);
        setAssassinHitBy(currentTurnTeam);
        setWinner(opponentTeam);
        // setWinningReason(`${currentTurnTeam} がアサシンを指定しました！`);
        addLogEntry({
          type: LogEntryType.GAME_OVER_ASSASSIN,
          team: opponentTeam, // Winner
          message: `${currentTurnTeam}チームがアサシンを選択したため、${opponentTeam}チームの勝利！`,
        });
        return; 
    }

    if (newRedAgentsLeft === 0) {
      setGamePhase(GamePhase.GAME_OVER);
      setWinner(Team.RED);
      // setWinningReason("Red Team のエージェントを全て発見！");
      addLogEntry({ type: LogEntryType.GAME_OVER_AGENTS, team: Team.RED });
      return;
    }
    if (newBlueAgentsLeft === 0) {
      setGamePhase(GamePhase.GAME_OVER);
      setWinner(Team.BLUE);
      // setWinningReason("Blue Team のエージェントを全て発見！");
      addLogEntry({ type: LogEntryType.GAME_OVER_AGENTS, team: Team.BLUE });
      return;
    }

    if (turnOver || guessesAfterThisOne >= maxGuessesAllowedForClue) {
      if (!turnOver && guessesAfterThisOne >= maxGuessesAllowedForClue) {
        turnEndReason = "最大推測回数に到達";
      }
      endTurn(false, turnEndReason);
    }
  }, [cards, gamePhase, redAgentsLeft, blueAgentsLeft, guessesMadeThisTurn, maxGuessesAllowedForClue, endTurn, addLogEntry]);


  const handleSubmitClue = (word: string, count: number) => {
    const spymasterTeam = gamePhase === GamePhase.RED_SPYMASTER_CLUE ? Team.RED : Team.BLUE;
    const spymaster = players.find(p => p.team === spymasterTeam && p.isSpymaster);

    addLogEntry({
      type: LogEntryType.CLUE_GIVEN,
      team: spymasterTeam,
      playerName: spymaster ? spymaster.name : 'スパイマスター',
      clueWord: word,
      clueCount: count,
    });

    setCurrentClue({ word, count });
    setGuessesMadeThisTurn(0);
    setMaxGuessesAllowedForClue(count + 1); 
    if (gamePhase === GamePhase.RED_SPYMASTER_CLUE) {
      setGamePhase(GamePhase.RED_OPERATIVE_GUESS);
    } else if (gamePhase === GamePhase.BLUE_SPYMASTER_CLUE) {
      setGamePhase(GamePhase.BLUE_OPERATIVE_GUESS);
    }
  };
  
  const currentTeamForTurn = (): Team | null => {
    if (gamePhase === GamePhase.RED_SPYMASTER_CLUE || gamePhase === GamePhase.RED_OPERATIVE_GUESS) return Team.RED;
    if (gamePhase === GamePhase.BLUE_SPYMASTER_CLUE || gamePhase === GamePhase.BLUE_OPERATIVE_GUESS) return Team.BLUE;
    return null;
  }

  if (gamePhase === GamePhase.PLAYER_SETUP) {
    return (
      <PlayerSetup
        players={players}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onSetPlayerTeam={handleSetPlayerTeam}
        onSetSpymaster={handleSetSpymaster}
        onStartGame={handleStartGameSetup}
      />
    );
  }

  if (gamePhase === GamePhase.BOARD_INITIALIZATION || isLoadingBoard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-800 text-white p-4">
        <Header isSpymasterView={isSpymasterView} onToggleSpymasterView={handleToggleSpymasterView} gamePhase={gamePhase} />
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">スマブラ・コードネーム</h1>
            <p className="text-xl mb-8">新しいゲームを読み込み中...</p>
            <div role="status" className="flex justify-center items-center">
                <svg aria-hidden="true" className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">読み込み中...</span>
            </div>
        </div>
      </div>
    );
  }

  const isOperativePhase = gamePhase === GamePhase.RED_OPERATIVE_GUESS || gamePhase === GamePhase.BLUE_OPERATIVE_GUESS;
  const isSpymasterPhase = gamePhase === GamePhase.RED_SPYMASTER_CLUE || gamePhase === GamePhase.BLUE_SPYMASTER_CLUE;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header isSpymasterView={isSpymasterView} onToggleSpymasterView={handleToggleSpymasterView} gamePhase={gamePhase} />
      
      <main className="container mx-auto p-4 flex-grow">
        {/* Thematic intro message is removed from here */}
        {/* gameIntroMessage && gamePhase !== GamePhase.GAME_OVER && ( ... ) */}

        <Scoreboard
          redAgentsLeft={redAgentsLeft}
          blueAgentsLeft={blueAgentsLeft}
          currentClue={currentClue}
          gamePhase={gamePhase}
          startingTeam={startingTeam}
          guessesLeftForClue={isOperativePhase && currentClue ? maxGuessesAllowedForClue - guessesMadeThisTurn : undefined}
          winner={winner}
          assassinHitBy={assassinHitBy}
          showGameOverModalState={showGameOverModal}
          onShowGameOverModal={() => setShowGameOverModal(true)}
          players={players}
        />

        {isSpymasterPhase && currentTeamForTurn() && (
          <ClueInput
            currentTeam={currentTeamForTurn()!}
            onSubmitClue={handleSubmitClue}
          />
        )}

        {isOperativePhase && currentClue && (
          <div className="text-center my-4">
            <p className="text-lg">オペレーター、このヒントに対して残り <span className="font-bold">{Math.max(0, maxGuessesAllowedForClue - guessesMadeThisTurn)}</span> 回推測できます。</p>
            {(maxGuessesAllowedForClue - guessesMadeThisTurn > 0) && (guessesMadeThisTurn > 0 || currentClue.count === 0) && ( // Allow ending turn if at least one guess made OR clue count was 0 (unlimited)
              <button
                onClick={() => endTurn(true)} // manualEnd = true
                className="mt-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded hover:bg-yellow-600 transition-colors"
              >
                このターンの推測を終了
              </button>
            )}
          </div>
        )}
        
        <Board
          cards={cards}
          onCardClick={handleCardClick}
          isSpymasterView={isSpymasterView}
          currentTurnTeam={currentTeamForTurn()}
          gamePhase={gamePhase}
        />

        <GameLog logEntries={gameLog} />

      </main>

      {gamePhase === GamePhase.GAME_OVER && showGameOverModal && (winner !== null || assassinHitBy !== null) && (
        <GameOverModal
          winner={winner}
          assassinHitBy={assassinHitBy}
          onPlayAgain={() => {
            setPlayers([]); 
            setNextPlayerId(1);
            setGameLog([]); // Clear log for player setup
            setGamePhase(GamePhase.PLAYER_SETUP);
          }}
          onClose={() => setShowGameOverModal(false)}
          // Pass correct scores for display
          redScore={initialRedAgentCount - (assassinHitBy === Team.BLUE ? redAgentsLeft : (winner === Team.RED ? 0 : redAgentsLeft) ) }
          blueScore={initialBlueAgentCount - (assassinHitBy === Team.RED ? blueAgentsLeft : (winner === Team.BLUE ? 0 : blueAgentsLeft) )}
          totalRedAgents={initialRedAgentCount}
          totalBlueAgents={initialBlueAgentCount}
        />
      )}
      <footer className="text-center p-4 text-neutral-600 text-sm bg-neutral-200">
        スマブラ・コードネーム オンライン - ゲームをお楽しみください！
      </footer>
    </div>
  );
};

export default App;
