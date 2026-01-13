import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Minus, RotateCcw, Save, Download, Upload, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TeamScore {
  name: string;
  criteria: number[]; // 0-3 for criteria 1-7, 0-10 for criteria 8
}

const CRITERIA = [
  { id: 1, name: 'STARTHØJDE OK', description: '175-180 cm', maxPoints: 3 },
  { id: 2, name: 'SLUTHØJDE OK', description: '25-30 cm', maxPoints: 3 },
  { id: 3, name: 'LUKKET RØRSYSTEM', description: 'Lufttæt', maxPoints: 3 },
  { id: 4, name: 'ADD-ON DROP', description: '15 cm', maxPoints: 3 },
  { id: 5, name: 'DROP POSITION', description: '50 cm vertikal / 50 cm før slut', maxPoints: 3 },
  { id: 6, name: '2 HELE OMGANGE', description: '6 sider', maxPoints: 3 },
  { id: 7, name: 'DUR DEN?', description: 'Gennemrul x2', maxPoints: 3 },
  { id: 8, name: 'KOLLEGAPOINT', description: 'Samlet vurdering', maxPoints: 10 },
];

const MAX_TOTAL = 31;

const createEmptyTeam = (name: string): TeamScore => ({
  name,
  criteria: [0, 0, 0, 0, 0, 0, 0, 0],
});

const TeamConstructScorecard: React.FC = () => {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<TeamScore[]>([
    createEmptyTeam('HOLD 1'),
    createEmptyTeam('HOLD 2'),
    createEmptyTeam('HOLD 3'),
    createEmptyTeam('HOLD 4'),
    createEmptyTeam('HOLD 5'),
    createEmptyTeam('HOLD 6'),
  ]);
  const [editingTeamName, setEditingTeamName] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('teamconstruct_scorecard');
    if (saved) {
      try {
        setTeams(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load scorecard:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('teamconstruct_scorecard', JSON.stringify(teams));
  }, [teams]);

  const updateScore = (teamIndex: number, criteriaIndex: number, delta: number) => {
    setTeams(prev => prev.map((team, i) => {
      if (i !== teamIndex) return team;
      const newCriteria = [...team.criteria];
      const maxPoints = CRITERIA[criteriaIndex].maxPoints;
      newCriteria[criteriaIndex] = Math.max(0, Math.min(maxPoints, newCriteria[criteriaIndex] + delta));
      return { ...team, criteria: newCriteria };
    }));
  };

  const setScore = (teamIndex: number, criteriaIndex: number, value: number) => {
    setTeams(prev => prev.map((team, i) => {
      if (i !== teamIndex) return team;
      const newCriteria = [...team.criteria];
      const maxPoints = CRITERIA[criteriaIndex].maxPoints;
      newCriteria[criteriaIndex] = Math.max(0, Math.min(maxPoints, value));
      return { ...team, criteria: newCriteria };
    }));
  };

  const getTeamTotal = (team: TeamScore): number => {
    return team.criteria.reduce((sum, score) => sum + score, 0);
  };

  const resetAll = () => {
    if (confirm('Nulstil alle scores?')) {
      setTeams([
        createEmptyTeam('HOLD 1'),
        createEmptyTeam('HOLD 2'),
        createEmptyTeam('HOLD 3'),
        createEmptyTeam('HOLD 4'),
        createEmptyTeam('HOLD 5'),
        createEmptyTeam('HOLD 6'),
      ]);
    }
  };

  const startEditingName = (index: number) => {
    setEditingTeamName(index);
    setTempName(teams[index].name);
  };

  const saveName = (index: number) => {
    if (tempName.trim()) {
      setTeams(prev => prev.map((team, i) =>
        i === index ? { ...team, name: tempName.trim().toUpperCase() } : team
      ));
    }
    setEditingTeamName(null);
  };

  const addTeam = () => {
    setTeams(prev => [...prev, createEmptyTeam(`HOLD ${prev.length + 1}`)]);
  };

  const removeTeam = (index: number) => {
    if (teams.length > 2 && confirm(`Fjern ${teams[index].name}?`)) {
      setTeams(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Find winner(s)
  const maxScore = Math.max(...teams.map(getTeamTotal));
  const winners = teams.filter(t => getTeamTotal(t) === maxScore && maxScore > 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-3 tablet:p-4 lg:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 tablet:mb-6">
          <div className="flex items-center gap-2 tablet:gap-3">
            <Trophy className="w-6 h-6 tablet:w-8 tablet:h-8 text-battle-orange" />
            <div>
              <h2 className="text-base tablet:text-xl font-bold text-white uppercase tracking-wider">VURDERINGSSKEMA</h2>
              <p className="text-[10px] tablet:text-xs text-gray-500 uppercase">Max {MAX_TOTAL} point</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addTeam}
              className="flex items-center gap-1 px-2 tablet:px-3 py-1.5 tablet:py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-xs uppercase hover:bg-green-500/30 transition-colors"
            >
              <Plus className="w-3 h-3 tablet:w-4 tablet:h-4" />
              <span className="hidden tablet:inline">HOLD</span>
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-1 px-2 tablet:px-3 py-1.5 tablet:py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs uppercase hover:bg-red-500/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3 tablet:w-4 tablet:h-4" />
              <span className="hidden tablet:inline">NULSTIL</span>
            </button>
          </div>
        </div>

        {/* Scrollable table container */}
        <div className="overflow-x-auto -mx-3 tablet:-mx-4 lg:-mx-6 px-3 tablet:px-4 lg:px-6">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 tablet:py-3 px-2 text-xs tablet:text-sm font-bold text-gray-400 uppercase w-48">
                  KRITERIER
                </th>
                {teams.map((team, index) => (
                  <th key={index} className="py-2 tablet:py-3 px-1 tablet:px-2 text-center min-w-[80px] tablet:min-w-[100px]">
                    {editingTeamName === index ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveName(index)}
                          className="w-full bg-battle-black/50 border border-battle-orange/50 rounded px-1 py-0.5 text-xs text-white text-center uppercase"
                          autoFocus
                        />
                        <button onClick={() => saveName(index)} className="text-green-400">
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="group relative">
                        <button
                          onClick={() => startEditingName(index)}
                          className={`text-[10px] tablet:text-xs font-bold uppercase tracking-wider ${
                            winners.includes(team) && maxScore > 0
                              ? 'text-battle-orange'
                              : 'text-gray-300'
                          } hover:text-battle-orange transition-colors`}
                        >
                          {team.name}
                        </button>
                        {teams.length > 2 && (
                          <button
                            onClick={() => removeTeam(index)}
                            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((criteria, criteriaIndex) => (
                <tr key={criteria.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 tablet:py-3 px-2">
                    <div className="text-xs tablet:text-sm font-medium text-white">{criteria.name}</div>
                    <div className="text-[10px] tablet:text-xs text-gray-500">{criteria.description}</div>
                    <div className="text-[10px] text-battle-orange">Max {criteria.maxPoints} point</div>
                  </td>
                  {teams.map((team, teamIndex) => (
                    <td key={teamIndex} className="py-2 tablet:py-3 px-1 tablet:px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateScore(teamIndex, criteriaIndex, -1)}
                          className="w-6 h-6 tablet:w-7 tablet:h-7 rounded bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={`w-6 tablet:w-8 text-center font-bold text-sm tablet:text-base ${
                          team.criteria[criteriaIndex] === criteria.maxPoints
                            ? 'text-green-400'
                            : team.criteria[criteriaIndex] > 0
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}>
                          {team.criteria[criteriaIndex]}
                        </span>
                        <button
                          onClick={() => updateScore(teamIndex, criteriaIndex, 1)}
                          className="w-6 h-6 tablet:w-7 tablet:h-7 rounded bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-battle-orange/10 border-t-2 border-battle-orange/30">
                <td className="py-3 tablet:py-4 px-2">
                  <div className="text-sm tablet:text-base font-bold text-battle-orange uppercase">TOTAL</div>
                </td>
                {teams.map((team, index) => {
                  const total = getTeamTotal(team);
                  const isWinner = winners.includes(team) && maxScore > 0;
                  return (
                    <td key={index} className="py-3 tablet:py-4 px-1 tablet:px-2 text-center">
                      <div className={`text-lg tablet:text-2xl font-bold ${
                        isWinner ? 'text-battle-orange' : 'text-white'
                      }`}>
                        {total}
                        {isWinner && <Trophy className="inline w-4 h-4 tablet:w-5 tablet:h-5 ml-1 text-yellow-400" />}
                      </div>
                      <div className="text-[10px] text-gray-500">/ {MAX_TOTAL}</div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Winner announcement */}
        {winners.length > 0 && maxScore > 0 && (
          <div className="mt-4 tablet:mt-6 p-3 tablet:p-4 bg-battle-orange/20 border border-battle-orange/30 rounded-xl text-center">
            <Trophy className="w-8 h-8 tablet:w-10 tablet:h-10 text-yellow-400 mx-auto mb-2" />
            <div className="text-lg tablet:text-xl font-bold text-white uppercase">
              {winners.length === 1 ? 'VINDER' : 'VINDERE'}
            </div>
            <div className="text-xl tablet:text-2xl font-bold text-battle-orange">
              {winners.map(w => w.name).join(' & ')}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {maxScore} point
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamConstructScorecard;
