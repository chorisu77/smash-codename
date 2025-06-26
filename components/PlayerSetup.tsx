import React, { useState } from 'react';
import { Player, Team } from '../types';

interface PlayerSetupProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onSetPlayerTeam: (id: string, team: Team | null) => void;
  onSetSpymaster: (id: string, team: Team) => void;
  onStartGame: () => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({
  players,
  onAddPlayer,
  onRemovePlayer,
  onSetPlayerTeam,
  onSetSpymaster,
  onStartGame,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (newPlayerName.trim() === '') {
      alert('プレイヤー名を入力してください。');
      return;
    }
    if (players.find(p => p.name === newPlayerName.trim())) {
      alert('同じ名前のプレイヤーが既に存在します。');
      return;
    }
    onAddPlayer(newPlayerName.trim());
    setNewPlayerName('');
  };

  const redTeamPlayers = players.filter(p => p.team === Team.RED);
  const blueTeamPlayers = players.filter(p => p.team === Team.BLUE);
  const unassignedPlayers = players.filter(p => p.team === null);

  const redSpymaster = redTeamPlayers.find(p => p.isSpymaster);
  const blueSpymaster = blueTeamPlayers.find(p => p.isSpymaster);

  const canStartGame = 
    redTeamPlayers.length > 0 &&
    blueTeamPlayers.length > 0 &&
    redSpymaster !== undefined &&
    blueSpymaster !== undefined &&
    (redTeamPlayers.length > 1 || blueTeamPlayers.length > 1); // At least one team needs an operative besides spymaster, or game is trivial. Or simply, at least one operative overall. Let's ensure each team has at least one operative if spymaster is set.
    // Simpler: at least 1 player on each team, and 1 spymaster for each team.
    // The original rule: At least one spymaster per team. At least one operative per team.
    // For 2 players total (1 per team), both are spymasters and operatives? No, that's not codenames.
    // Minimum 2 players per team for a classic game (1 spymaster, 1 operative).
    // For this app, let's enforce: 1 spymaster per team, and at least 1 player on each team.
    // If a team has only 1 player, that player must be the spymaster (and implicitly also the operative, though unusual).
    // Or, more strictly: at least 2 players in the game total. One spymaster per team.
    // Let's go with: Red team has players, Blue team has players, Red has a spymaster, Blue has a spymaster.
  
  const isGameReadyToStart = redTeamPlayers.length >= 1 && blueTeamPlayers.length >= 1 && redSpymaster && blueSpymaster;


  const renderPlayerCard = (player: Player, teamContext?: Team | null) => (
    <div key={player.id} className="p-3 mb-2 border rounded-md bg-white shadow flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <span className={`font-semibold ${player.isSpymaster ? 'text-yellow-600' : ''}`}>
        {player.name} {player.isSpymaster ? '👑 (スパイマスター)' : ''}
      </span>
      <div className="mt-2 sm:mt-0 space-y-1 sm:space-y-0 sm:space-x-1">
        {player.team === null && (
          <>
            <button onClick={() => onSetPlayerTeam(player.id, Team.RED)} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto">Redチームへ</button>
            <button onClick={() => onSetPlayerTeam(player.id, Team.BLUE)} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto">Blueチームへ</button>
          </>
        )}
        {player.team === Team.RED && (
          <>
            {!player.isSpymaster && <button onClick={() => onSetSpymaster(player.id, Team.RED)} className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 w-full sm:w-auto">スパイマスターにする</button>}
            <button onClick={() => onSetPlayerTeam(player.id, Team.BLUE)} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto">Blueチームへ変更</button>
            <button onClick={() => onSetPlayerTeam(player.id, null)} className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 w-full sm:w-auto">チームから外す</button>
          </>
        )}
        {player.team === Team.BLUE && (
          <>
            {!player.isSpymaster && <button onClick={() => onSetSpymaster(player.id, Team.BLUE)} className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 w-full sm:w-auto">スパイマスターにする</button>}
            <button onClick={() => onSetPlayerTeam(player.id, Team.RED)} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto">Redチームへ変更</button>
            <button onClick={() => onSetPlayerTeam(player.id, null)} className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 w-full sm:w-auto">チームから外す</button>
          </>
        )}
        <button onClick={() => onRemovePlayer(player.id)} className="px-2 py-1 text-xs bg-neutral-500 text-white rounded hover:bg-neutral-600 w-full sm:w-auto">削除</button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto bg-neutral-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6 text-neutral-800">プレイヤー設定</h2>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-3 text-neutral-700">新しいプレイヤーを追加</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="プレイヤー名"
            className="flex-grow p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleAddPlayer}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            プレイヤー追加
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Unassigned Players */}
        <div className="p-4 bg-neutral-200 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-neutral-700">未割り当て ({unassignedPlayers.length}人)</h3>
          {unassignedPlayers.length > 0 ? unassignedPlayers.map(p => renderPlayerCard(p)) : <p className="text-sm text-neutral-500">新しいプレイヤーを追加するか、チームからプレイヤーを移動してください。</p>}
        </div>

        {/* Red Team */}
        <div className="p-4 bg-red-100 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-red-700">Redチーム ({redTeamPlayers.length}人)</h3>
          {redSpymaster && <p className="text-sm text-red-600 mb-2">スパイマスター: {redSpymaster.name} 👑</p>}
          {!redSpymaster && redTeamPlayers.length > 0 && <p className="text-sm text-red-600 mb-2">スパイマスターを選んでください。</p>}
          {redTeamPlayers.map(p => renderPlayerCard(p, Team.RED))}
          {redTeamPlayers.length === 0 && <p className="text-sm text-red-500">プレイヤーをこのチームに割り当ててください。</p>}
        </div>

        {/* Blue Team */}
        <div className="p-4 bg-blue-100 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-blue-700">Blueチーム ({blueTeamPlayers.length}人)</h3>
          {blueSpymaster && <p className="text-sm text-blue-600 mb-2">スパイマスター: {blueSpymaster.name} 👑</p>}
          {!blueSpymaster && blueTeamPlayers.length > 0 && <p className="text-sm text-blue-600 mb-2">スパイマスターを選んでください。</p>}
          {blueTeamPlayers.map(p => renderPlayerCard(p, Team.BLUE))}
          {blueTeamPlayers.length === 0 && <p className="text-sm text-blue-500">プレイヤーをこのチームに割り当ててください。</p>}
        </div>
      </div>
      
      {!isGameReadyToStart && (
        <div className="text-center p-3 mb-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md">
          <p>ゲームを開始するには、以下の条件を満たしてください：</p>
          <ul className="list-disc list-inside text-sm">
            <li className={redTeamPlayers.length >= 1 ? 'text-green-600' : 'text-red-600'}>Redチームに最低1人のプレイヤーがいる {redTeamPlayers.length >= 1 ? '✅' : '❌'}</li>
            <li className={blueTeamPlayers.length >= 1 ? 'text-green-600' : 'text-red-600'}>Blueチームに最低1人のプレイヤーがいる {blueTeamPlayers.length >= 1 ? '✅' : '❌'}</li>
            <li className={redSpymaster ? 'text-green-600' : 'text-red-600'}>Redチームにスパイマスターが指定されている {redSpymaster ? '✅' : '❌'}</li>
            <li className={blueSpymaster ? 'text-green-600' : 'text-red-600'}>Blueチームにスパイマスターが指定されている {blueSpymaster ? '✅' : '❌'}</li>
          </ul>
        </div>
      )}

      <button
        onClick={onStartGame}
        disabled={!isGameReadyToStart}
        className="w-full px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-neutral-400 disabled:cursor-not-allowed"
      >
        ゲーム開始！
      </button>
    </div>
  );
};

export default PlayerSetup;
