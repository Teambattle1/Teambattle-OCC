import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save,
  FolderOpen,
  Trash2,
  Cloud,
  CloudOff,
  Plus,
  Minus,
  Play,
  Square,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Users,
  ClipboardCheck,
  Timer,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Settings,
  Flag,
  AlertTriangle,
  Check,
  X,
  Maximize2
} from 'lucide-react';
import {
  saveTeamRaceSession,
  loadTeamRaceSession,
  getAllTeamRaceSessions,
  deleteTeamRaceSession,
  TeamRaceSession
} from '../lib/supabase';

// ============ Types ============
interface Team {
  id: string;
  name: string;
  color: string;
  inspectionScore: number;
  inspectionNotes: string;
}

interface RaceResult {
  teamId: string;
  startOffset: number;
  finishTime: number | null;
  netTime: number | null;
  penalties: number;
  penaltyReasons: string[];
}

interface Heat {
  id: string;
  name: string;
  type: 'qualification' | 'semifinal' | 'final';
  teamIds: string[];
  results: RaceResult[];
  status: 'pending' | 'in_progress' | 'completed';
}

interface TournamentSettings {
  staggeredStartInterval: number;
  penaltySeconds: number;
  teamsPerHeat: number;
  advanceToFinal: number;
}

interface Tournament {
  teams: Team[];
  heats: Heat[];
  settings: TournamentSettings;
}

// ============ Constants ============
const DEFAULT_COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#22C55E', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

const PENALTY_REASONS = [
  'Kegle væltet',
  'Baneudskridning',
  'Ulovlig start',
  'Snyd',
  'Anden',
];

// ============ Utility Functions ============
const generateId = () => Math.random().toString(36).substring(2, 9);

const formatTime = (ms: number | null): string => {
  if (ms === null) return '--:--.---';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

const formatTimeShort = (ms: number | null): string => {
  if (ms === null) return '--:--.--';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
};

// ============ Custom Hooks ============
const useRaceTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const updateTimer = useCallback(() => {
    if (startTimeRef.current > 0) {
      setElapsedTime(performance.now() - startTimeRef.current);
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    setIsRunning(true);
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  }, [updateTimer]);

  const stop = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
    setIsRunning(false);
    return elapsedTime;
  }, [elapsedTime]);

  const reset = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
    setIsRunning(false);
    setElapsedTime(0);
    startTimeRef.current = 0;
  }, []);

  const getTime = useCallback(() => {
    if (!isRunning) return elapsedTime;
    return performance.now() - startTimeRef.current;
  }, [isRunning, elapsedTime]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return { isRunning, elapsedTime, start, stop, reset, getTime };
};

// ============ Sound Effects ============
const playSound = (type: 'start' | 'finish' | 'penalty') => {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  switch (type) {
    case 'start':
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      break;
    case 'finish':
      oscillator.frequency.setValueAtTime(1320, audioContext.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      break;
    case 'penalty':
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      break;
  }
};

const speakDanish = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'da-DK';
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  }
};

// ============ Main Component ============
const TeamRaceScorecard: React.FC = () => {
  // ============ State ============
  const [activeTab, setActiveTab] = useState<'setup' | 'inspection' | 'racing' | 'results'>('setup');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullscreenLeaderboard, setFullscreenLeaderboard] = useState(false);

  // Tournament State
  const [tournament, setTournament] = useState<Tournament>({
    teams: [
      { id: generateId(), name: 'Hold 1', color: DEFAULT_COLORS[0], inspectionScore: 0, inspectionNotes: '' },
      { id: generateId(), name: 'Hold 2', color: DEFAULT_COLORS[1], inspectionScore: 0, inspectionNotes: '' },
      { id: generateId(), name: 'Hold 3', color: DEFAULT_COLORS[2], inspectionScore: 0, inspectionNotes: '' },
      { id: generateId(), name: 'Hold 4', color: DEFAULT_COLORS[3], inspectionScore: 0, inspectionNotes: '' },
    ],
    heats: [],
    settings: {
      staggeredStartInterval: 15,
      penaltySeconds: 10,
      teamsPerHeat: 4,
      advanceToFinal: 4,
    },
  });

  // Racing State
  const [currentHeatIndex, setCurrentHeatIndex] = useState(0);
  const [teamFinishTimes, setTeamFinishTimes] = useState<{ [teamId: string]: number | null }>({});
  const timer = useRaceTimer();

  // Sync State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [savedSessions, setSavedSessions] = useState<TeamRaceSession[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'unsaved' | 'error'>('unsaved');

  // ============ Effects ============
  useEffect(() => {
    loadSavedSessions();
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('teamrace_tournament', JSON.stringify(tournament));
    setSyncStatus('unsaved');
  }, [tournament]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('teamrace_tournament');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTournament(parsed);
      } catch (e) {
        console.error('Failed to parse saved tournament:', e);
      }
    }
  }, []);

  // ============ Cloud Sync Functions ============
  const loadSavedSessions = async () => {
    const result = await getAllTeamRaceSessions();
    if (result.success && result.data) {
      setSavedSessions(result.data);
    }
  };

  const handleSave = async () => {
    if (!sessionName.trim()) {
      alert('Indtast et navn til sessionen');
      return;
    }
    setIsSaving(true);
    const result = await saveTeamRaceSession(sessionName, tournament, sessionId || undefined);
    if (result.success) {
      setSessionId(result.id || null);
      setSyncStatus('saved');
      await loadSavedSessions();
    } else {
      setSyncStatus('error');
      alert('Fejl ved gemning: ' + result.error);
    }
    setIsSaving(false);
  };

  const handleLoad = async (id: string) => {
    setIsLoading(true);
    const result = await loadTeamRaceSession(id);
    if (result.success && result.data) {
      setTournament(result.data.tournament_data as Tournament);
      setSessionId(result.data.id || null);
      setSessionName(result.data.session_name);
      setSyncStatus('saved');
      setShowSessionList(false);
    } else {
      alert('Fejl ved indlæsning: ' + result.error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne session?')) return;
    const result = await deleteTeamRaceSession(id);
    if (result.success) {
      if (sessionId === id) {
        setSessionId(null);
        setSessionName('');
      }
      await loadSavedSessions();
    } else {
      alert('Fejl ved sletning: ' + result.error);
    }
  };

  const handleNewSession = () => {
    setSessionId(null);
    setSessionName('');
    setTournament({
      teams: [
        { id: generateId(), name: 'Hold 1', color: DEFAULT_COLORS[0], inspectionScore: 0, inspectionNotes: '' },
        { id: generateId(), name: 'Hold 2', color: DEFAULT_COLORS[1], inspectionScore: 0, inspectionNotes: '' },
        { id: generateId(), name: 'Hold 3', color: DEFAULT_COLORS[2], inspectionScore: 0, inspectionNotes: '' },
        { id: generateId(), name: 'Hold 4', color: DEFAULT_COLORS[3], inspectionScore: 0, inspectionNotes: '' },
      ],
      heats: [],
      settings: {
        staggeredStartInterval: 15,
        penaltySeconds: 10,
        teamsPerHeat: 4,
        advanceToFinal: 4,
      },
    });
    setCurrentHeatIndex(0);
    setTeamFinishTimes({});
    timer.reset();
    setSyncStatus('unsaved');
  };

  // ============ Team Management ============
  const addTeam = () => {
    if (tournament.teams.length >= 8) return;
    const newTeam: Team = {
      id: generateId(),
      name: `Hold ${tournament.teams.length + 1}`,
      color: DEFAULT_COLORS[tournament.teams.length % DEFAULT_COLORS.length],
      inspectionScore: 0,
      inspectionNotes: '',
    };
    setTournament(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam],
    }));
  };

  const removeTeam = (teamId: string) => {
    if (tournament.teams.length <= 2) return;
    setTournament(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.id !== teamId),
    }));
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTournament(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, ...updates } : t),
    }));
  };

  const updateSettings = (updates: Partial<TournamentSettings>) => {
    setTournament(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  };

  // ============ Heat Generation ============
  const generateHeats = () => {
    const { teams, settings } = tournament;
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const heats: Heat[] = [];

    // Create qualification heats
    for (let i = 0; i < shuffledTeams.length; i += settings.teamsPerHeat) {
      const heatTeams = shuffledTeams.slice(i, i + settings.teamsPerHeat);
      heats.push({
        id: generateId(),
        name: `Kvalifikation ${Math.floor(i / settings.teamsPerHeat) + 1}`,
        type: 'qualification',
        teamIds: heatTeams.map(t => t.id),
        results: heatTeams.map((t, idx) => ({
          teamId: t.id,
          startOffset: -idx * settings.staggeredStartInterval * 1000,
          finishTime: null,
          netTime: null,
          penalties: 0,
          penaltyReasons: [],
        })),
        status: 'pending',
      });
    }

    // Create empty final heat
    heats.push({
      id: generateId(),
      name: 'FINALE',
      type: 'final',
      teamIds: [],
      results: [],
      status: 'pending',
    });

    setTournament(prev => ({ ...prev, heats }));
    setCurrentHeatIndex(0);
  };

  // ============ Racing Functions ============
  const currentHeat = tournament.heats[currentHeatIndex];

  const startRace = () => {
    if (!currentHeat || currentHeat.status === 'completed') return;

    // Update heat status
    setTournament(prev => ({
      ...prev,
      heats: prev.heats.map((h, idx) =>
        idx === currentHeatIndex ? { ...h, status: 'in_progress' } : h
      ),
    }));

    // Reset finish times
    setTeamFinishTimes({});
    timer.reset();
    timer.start();

    if (soundEnabled) {
      playSound('start');
      speakDanish('Løbet er startet!');
    }
  };

  const stopTeam = (teamId: string) => {
    if (!timer.isRunning) return;
    const finishTime = timer.getTime();
    setTeamFinishTimes(prev => ({ ...prev, [teamId]: finishTime }));

    if (soundEnabled) {
      const team = tournament.teams.find(t => t.id === teamId);
      playSound('finish');
      if (team) {
        speakDanish(`${team.name} er i mål!`);
      }
    }

    // Check if all teams have finished
    const heat = tournament.heats[currentHeatIndex];
    const allFinished = heat.teamIds.every(
      id => teamFinishTimes[id] !== undefined || id === teamId
    );

    if (allFinished) {
      finishRace();
    }
  };

  const finishRace = () => {
    timer.stop();

    // Calculate net times and update results
    setTournament(prev => ({
      ...prev,
      heats: prev.heats.map((h, idx) => {
        if (idx !== currentHeatIndex) return h;

        const updatedResults = h.results.map(r => {
          const finish = teamFinishTimes[r.teamId] ?? timer.getTime();
          const penaltyTime = r.penalties * prev.settings.penaltySeconds * 1000;
          const netTime = finish !== null ? finish - r.startOffset + penaltyTime : null;
          return {
            ...r,
            finishTime: finish,
            netTime,
          };
        });

        return {
          ...h,
          status: 'completed' as const,
          results: updatedResults,
        };
      }),
    }));

    if (soundEnabled) {
      speakDanish('Løbet er afsluttet!');
    }
  };

  const resetRace = () => {
    timer.reset();
    setTeamFinishTimes({});

    setTournament(prev => ({
      ...prev,
      heats: prev.heats.map((h, idx) => {
        if (idx !== currentHeatIndex) return h;
        return {
          ...h,
          status: 'pending' as const,
          results: h.results.map(r => ({
            ...r,
            finishTime: null,
            netTime: null,
          })),
        };
      }),
    }));
  };

  const addPenalty = (teamId: string, reason: string) => {
    if (soundEnabled) playSound('penalty');

    setTournament(prev => ({
      ...prev,
      heats: prev.heats.map((h, idx) => {
        if (idx !== currentHeatIndex) return h;
        return {
          ...h,
          results: h.results.map(r => {
            if (r.teamId !== teamId) return r;
            const newPenalties = r.penalties + 1;
            const penaltyTime = newPenalties * prev.settings.penaltySeconds * 1000;
            const netTime = r.finishTime !== null
              ? r.finishTime - r.startOffset + penaltyTime
              : null;
            return {
              ...r,
              penalties: newPenalties,
              penaltyReasons: [...r.penaltyReasons, reason],
              netTime,
            };
          }),
        };
      }),
    }));
  };

  const removePenalty = (teamId: string) => {
    setTournament(prev => ({
      ...prev,
      heats: prev.heats.map((h, idx) => {
        if (idx !== currentHeatIndex) return h;
        return {
          ...h,
          results: h.results.map(r => {
            if (r.teamId !== teamId || r.penalties === 0) return r;
            const newPenalties = r.penalties - 1;
            const penaltyTime = newPenalties * prev.settings.penaltySeconds * 1000;
            const netTime = r.finishTime !== null
              ? r.finishTime - r.startOffset + penaltyTime
              : null;
            return {
              ...r,
              penalties: newPenalties,
              penaltyReasons: r.penaltyReasons.slice(0, -1),
              netTime,
            };
          }),
        };
      }),
    }));
  };

  // ============ Results & Advancement ============
  const getQualificationResults = () => {
    const qualHeats = tournament.heats.filter(h => h.type === 'qualification' && h.status === 'completed');
    const allResults: { teamId: string; netTime: number; heatName: string }[] = [];

    qualHeats.forEach(heat => {
      heat.results.forEach(r => {
        if (r.netTime !== null) {
          allResults.push({
            teamId: r.teamId,
            netTime: r.netTime,
            heatName: heat.name,
          });
        }
      });
    });

    return allResults.sort((a, b) => a.netTime - b.netTime);
  };

  const advanceToFinal = () => {
    const results = getQualificationResults();
    const advancingTeams = results.slice(0, tournament.settings.advanceToFinal);
    const advancingIds = advancingTeams.map(r => r.teamId);

    setTournament(prev => ({
      ...prev,
      heats: prev.heats.map(h => {
        if (h.type !== 'final') return h;
        return {
          ...h,
          teamIds: advancingIds,
          results: advancingIds.map((id, idx) => ({
            teamId: id,
            startOffset: -idx * prev.settings.staggeredStartInterval * 1000,
            finishTime: null,
            netTime: null,
            penalties: 0,
            penaltyReasons: [],
          })),
        };
      }),
    }));

    // Navigate to final
    const finalIndex = tournament.heats.findIndex(h => h.type === 'final');
    if (finalIndex >= 0) {
      setCurrentHeatIndex(finalIndex);
    }
  };

  const getFinalResults = () => {
    const finalHeat = tournament.heats.find(h => h.type === 'final' && h.status === 'completed');
    if (!finalHeat) return [];

    return finalHeat.results
      .filter(r => r.netTime !== null)
      .sort((a, b) => (a.netTime || 0) - (b.netTime || 0))
      .map((r, idx) => ({
        ...r,
        rank: idx + 1,
        team: tournament.teams.find(t => t.id === r.teamId),
      }));
  };

  // ============ CSV Export ============
  const exportCSV = () => {
    let csv = 'Hold,Farve,Inspektion,';

    // Add heat columns
    tournament.heats.forEach(h => {
      csv += `${h.name} Brutto,${h.name} Straffe,${h.name} Netto,`;
    });
    csv += 'Endelig Placering\n';

    // Add team rows
    tournament.teams.forEach(team => {
      csv += `"${team.name}","${team.color}",${team.inspectionScore},`;

      tournament.heats.forEach(heat => {
        const result = heat.results.find(r => r.teamId === team.id);
        if (result) {
          csv += `${formatTime(result.finishTime)},${result.penalties * tournament.settings.penaltySeconds}s,${formatTime(result.netTime)},`;
        } else {
          csv += ',,,'
        }
      });

      // Final ranking
      const finalResults = getFinalResults();
      const finalRank = finalResults.find(r => r.teamId === team.id);
      csv += finalRank ? finalRank.rank.toString() : '';
      csv += '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `teamrace_${sessionName || 'resultater'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ============ Render Functions ============
  const renderCloudSync = () => (
    <div className="bg-battle-black/30 rounded-lg tablet:rounded-xl p-3 tablet:p-4 mb-4 border border-white/5">
      <div className="flex flex-wrap items-center gap-2 tablet:gap-3">
        <div className="flex items-center gap-2">
          {syncStatus === 'saved' ? (
            <Cloud className="w-4 h-4 tablet:w-5 tablet:h-5 text-green-400" />
          ) : syncStatus === 'error' ? (
            <CloudOff className="w-4 h-4 tablet:w-5 tablet:h-5 text-red-400" />
          ) : (
            <CloudOff className="w-4 h-4 tablet:w-5 tablet:h-5 text-gray-400" />
          )}
          <span className="text-xs tablet:text-sm text-gray-400">
            {syncStatus === 'saved' ? 'Gemt' : syncStatus === 'error' ? 'Fejl' : 'Ikke gemt'}
          </span>
        </div>

        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="Session navn..."
          className="flex-1 min-w-[140px] tablet:min-w-[200px] bg-battle-grey/50 border border-battle-grey rounded px-2 tablet:px-3 py-2 text-white text-sm touch-manipulation"
        />

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 tablet:px-4 py-2 bg-green-600 hover:bg-green-500 active:bg-green-400 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors text-xs tablet:text-sm touch-manipulation"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Gemmer...' : 'Gem'}
        </button>

        <button
          onClick={() => setShowSessionList(!showSessionList)}
          className="flex items-center gap-1.5 px-3 tablet:px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-400 text-white rounded-lg font-semibold transition-colors text-xs tablet:text-sm touch-manipulation"
        >
          <FolderOpen className="w-4 h-4" />
          Indl.
        </button>

        <button
          onClick={handleNewSession}
          className="px-3 tablet:px-4 py-2 bg-battle-grey/50 hover:bg-battle-grey active:bg-battle-grey/70 text-white rounded-lg font-semibold transition-colors text-xs tablet:text-sm touch-manipulation"
        >
          Ny
        </button>
      </div>

      {showSessionList && (
        <div className="mt-4 bg-battle-black/50 rounded-lg p-3 max-h-48 overflow-y-auto">
          {savedSessions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-2">Ingen gemte sessioner</p>
          ) : (
            <div className="space-y-2">
              {savedSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between bg-battle-grey/30 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-white font-medium">{session.session_name}</span>
                    <span className="text-gray-400 text-xs ml-2">
                      {session.updated_at ? new Date(session.updated_at).toLocaleDateString('da-DK') : ''}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoad(session.id!)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs touch-manipulation"
                    >
                      Åbn
                    </button>
                    <button
                      onClick={() => handleDelete(session.id!)}
                      className="p-1 text-red-400 hover:text-red-300 touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTabs = () => (
    <div className="flex gap-1 tablet:gap-2 mb-4 tablet:mb-6 overflow-x-auto pb-2">
      {[
        { id: 'setup', label: 'SETUP', icon: Users },
        { id: 'inspection', label: 'INSPEKTION', icon: ClipboardCheck },
        { id: 'racing', label: 'RACING', icon: Timer },
        { id: 'results', label: 'RESULTATER', icon: Trophy },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as typeof activeTab)}
          className={`flex items-center gap-1.5 tablet:gap-2 px-3 tablet:px-4 py-2 tablet:py-2.5 rounded-lg font-semibold transition-colors text-xs tablet:text-sm whitespace-nowrap touch-manipulation ${
            activeTab === tab.id
              ? 'bg-battle-orange text-white'
              : 'bg-battle-grey/30 text-gray-300 hover:bg-battle-grey/50'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderSetupTab = () => (
    <div className="space-y-4 tablet:space-y-6">
      {/* Settings */}
      <div className="bg-battle-black/30 rounded-xl p-4 border border-white/5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-battle-orange" />
          Turneringsindstillinger
        </h3>
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Startinterval (sek)</label>
            <input
              type="number"
              value={tournament.settings.staggeredStartInterval}
              onChange={(e) => updateSettings({ staggeredStartInterval: parseInt(e.target.value) || 15 })}
              className="w-full bg-battle-grey/50 border border-battle-grey rounded px-3 py-2 text-white text-center touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Strafsekunder</label>
            <input
              type="number"
              value={tournament.settings.penaltySeconds}
              onChange={(e) => updateSettings({ penaltySeconds: parseInt(e.target.value) || 10 })}
              className="w-full bg-battle-grey/50 border border-battle-grey rounded px-3 py-2 text-white text-center touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Hold per heat</label>
            <input
              type="number"
              value={tournament.settings.teamsPerHeat}
              onChange={(e) => updateSettings({ teamsPerHeat: parseInt(e.target.value) || 4 })}
              className="w-full bg-battle-grey/50 border border-battle-grey rounded px-3 py-2 text-white text-center touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Videre til finale</label>
            <input
              type="number"
              value={tournament.settings.advanceToFinal}
              onChange={(e) => updateSettings({ advanceToFinal: parseInt(e.target.value) || 4 })}
              className="w-full bg-battle-grey/50 border border-battle-grey rounded px-3 py-2 text-white text-center touch-manipulation"
            />
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="bg-battle-black/30 rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-battle-orange" />
            Hold ({tournament.teams.length})
          </h3>
          <button
            onClick={addTeam}
            disabled={tournament.teams.length >= 8}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg text-sm font-semibold touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            Tilf. Hold
          </button>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
          {tournament.teams.map((team, idx) => (
            <div
              key={team.id}
              className="flex items-center gap-3 bg-battle-grey/20 rounded-lg p-3 border-l-4"
              style={{ borderLeftColor: team.color }}
            >
              <input
                type="color"
                value={team.color}
                onChange={(e) => updateTeam(team.id, { color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent touch-manipulation"
              />
              <input
                type="text"
                value={team.name}
                onChange={(e) => updateTeam(team.id, { name: e.target.value })}
                className="flex-1 bg-battle-grey/50 border border-battle-grey rounded px-3 py-2 text-white touch-manipulation"
                placeholder="Holdnavn"
              />
              {tournament.teams.length > 2 && (
                <button
                  onClick={() => removeTeam(team.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors touch-manipulation"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generate Heats Button */}
      <div className="flex justify-center">
        <button
          onClick={generateHeats}
          className="flex items-center gap-2 px-6 py-3 bg-battle-orange hover:bg-battle-orangeLight text-white rounded-xl font-bold text-lg transition-colors touch-manipulation"
        >
          <Flag className="w-6 h-6" />
          Generer Heats
        </button>
      </div>

      {/* Heat Preview */}
      {tournament.heats.length > 0 && (
        <div className="bg-battle-black/30 rounded-xl p-4 border border-white/5">
          <h3 className="text-white font-bold mb-4">Genererede Heats</h3>
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-3">
            {tournament.heats.map(heat => (
              <div
                key={heat.id}
                className={`rounded-lg p-3 border ${
                  heat.type === 'final'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-battle-grey/20 border-white/10'
                }`}
              >
                <div className="font-bold text-white mb-2">{heat.name}</div>
                <div className="space-y-1">
                  {heat.teamIds.length === 0 ? (
                    <div className="text-gray-500 text-sm italic">Ingen hold endnu</div>
                  ) : (
                    heat.teamIds.map(teamId => {
                      const team = tournament.teams.find(t => t.id === teamId);
                      return team ? (
                        <div
                          key={teamId}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="text-gray-300">{team.name}</span>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInspectionTab = () => (
    <div className="space-y-4">
      <div className="bg-battle-black/30 rounded-xl p-4 border border-white/5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-battle-orange" />
          Bil-inspektion (0-5 point)
        </h3>
        <div className="space-y-4">
          {tournament.teams.map(team => (
            <div
              key={team.id}
              className="bg-battle-grey/20 rounded-lg p-4 border-l-4"
              style={{ borderLeftColor: team.color }}
            >
              <div className="flex flex-col tablet:flex-row tablet:items-center gap-4">
                <div className="flex items-center gap-3 min-w-[150px]">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="text-white font-bold">{team.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Score:</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => updateTeam(team.id, { inspectionScore: score })}
                        className={`w-10 h-10 rounded-lg font-bold text-lg transition-colors touch-manipulation ${
                          team.inspectionScore === score
                            ? 'bg-battle-orange text-white'
                            : 'bg-battle-grey/50 text-gray-300 hover:bg-battle-grey'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    value={team.inspectionNotes}
                    onChange={(e) => updateTeam(team.id, { inspectionNotes: e.target.value })}
                    placeholder="Noter (fejl, mangler...)"
                    className="w-full bg-battle-grey/50 border border-battle-grey rounded px-3 py-2 text-white text-sm touch-manipulation"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRacingTab = () => {
    if (tournament.heats.length === 0) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Ingen heats genereret endnu.</p>
          <p className="text-gray-500 mt-2">Gå til SETUP og generer heats først.</p>
        </div>
      );
    }

    const heat = currentHeat;
    if (!heat) return null;

    return (
      <div className="space-y-4">
        {/* Heat Navigation */}
        <div className="flex items-center justify-between bg-battle-black/30 rounded-xl p-3 border border-white/5">
          <button
            onClick={() => setCurrentHeatIndex(Math.max(0, currentHeatIndex - 1))}
            disabled={currentHeatIndex === 0}
            className="p-2 text-white disabled:text-gray-600 hover:bg-battle-grey/50 rounded-lg transition-colors touch-manipulation"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div className={`text-xl tablet:text-2xl font-bold ${
              heat.type === 'final' ? 'text-yellow-400' : 'text-white'
            }`}>
              {heat.name}
            </div>
            <div className="text-gray-400 text-sm">
              {heat.status === 'pending' && 'Venter'}
              {heat.status === 'in_progress' && 'I gang'}
              {heat.status === 'completed' && 'Afsluttet'}
            </div>
          </div>

          <button
            onClick={() => setCurrentHeatIndex(Math.min(tournament.heats.length - 1, currentHeatIndex + 1))}
            disabled={currentHeatIndex === tournament.heats.length - 1}
            className="p-2 text-white disabled:text-gray-600 hover:bg-battle-grey/50 rounded-lg transition-colors touch-manipulation"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors touch-manipulation ${
              soundEnabled ? 'bg-green-600/30 text-green-400' : 'bg-gray-600/30 text-gray-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-sm">{soundEnabled ? 'Lyd TIL' : 'Lyd FRA'}</span>
          </button>
        </div>

        {/* Main Timer */}
        <div className="bg-battle-black/50 rounded-2xl p-6 text-center border border-white/10">
          <div className="text-6xl tablet:text-8xl font-mono font-bold text-white tracking-wider mb-6">
            {formatTime(timer.isRunning ? timer.getTime() : timer.elapsedTime)}
          </div>

          <div className="flex justify-center gap-4">
            {!timer.isRunning && heat.status !== 'completed' && (
              <button
                onClick={startRace}
                className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-xl transition-colors touch-manipulation"
              >
                <Play className="w-8 h-8" />
                START
              </button>
            )}

            {timer.isRunning && (
              <button
                onClick={finishRace}
                className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xl transition-colors touch-manipulation"
              >
                <Square className="w-8 h-8" />
                STOP ALLE
              </button>
            )}

            <button
              onClick={resetRace}
              className="flex items-center gap-2 px-6 py-4 bg-battle-grey/50 hover:bg-battle-grey text-white rounded-xl font-bold text-xl transition-colors touch-manipulation"
            >
              <RotateCcw className="w-6 h-6" />
              NULSTIL
            </button>
          </div>
        </div>

        {/* Team Stop Buttons */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
          {heat.teamIds.map((teamId, idx) => {
            const team = tournament.teams.find(t => t.id === teamId);
            const result = heat.results.find(r => r.teamId === teamId);
            const hasFinished = teamFinishTimes[teamId] !== undefined || result?.finishTime !== null;
            const currentNetTime = result?.netTime ?? (
              teamFinishTimes[teamId] !== undefined
                ? teamFinishTimes[teamId]! - (result?.startOffset || 0) + (result?.penalties || 0) * tournament.settings.penaltySeconds * 1000
                : null
            );

            return team ? (
              <div
                key={teamId}
                className="bg-battle-grey/20 rounded-xl p-4 border-l-4"
                style={{ borderLeftColor: team.color }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="text-white font-bold text-lg">{team.name}</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Start: {result?.startOffset !== undefined ? `${result.startOffset / 1000}s` : '--'}
                  </div>
                </div>

                {/* Time Display */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-mono font-bold text-white">
                    {formatTimeShort(currentNetTime)}
                  </div>
                  <div className="text-xs text-gray-500">Nettid</div>
                </div>

                {/* Stop Button */}
                <button
                  onClick={() => stopTeam(teamId)}
                  disabled={!timer.isRunning || hasFinished}
                  className={`w-full py-4 rounded-xl font-bold text-xl transition-colors touch-manipulation ${
                    hasFinished
                      ? 'bg-green-600/50 text-green-200 cursor-default'
                      : timer.isRunning
                        ? 'bg-red-600 hover:bg-red-500 active:bg-red-400 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {hasFinished ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-6 h-6" /> I MÅL
                    </span>
                  ) : (
                    'STOP'
                  )}
                </button>

                {/* Penalties */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold">Straffe: {result?.penalties || 0}</span>
                    <span className="text-gray-500 text-sm">
                      (+{(result?.penalties || 0) * tournament.settings.penaltySeconds}s)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => removePenalty(teamId)}
                      disabled={(result?.penalties || 0) === 0}
                      className="p-2 bg-green-600/30 text-green-400 rounded-lg disabled:opacity-30 touch-manipulation"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => addPenalty(teamId, 'Kegle væltet')}
                        className="p-2 bg-red-600/30 text-red-400 rounded-lg touch-manipulation"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Penalty Buttons */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {PENALTY_REASONS.slice(0, 3).map(reason => (
                    <button
                      key={reason}
                      onClick={() => addPenalty(teamId, reason)}
                      className="px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs hover:bg-red-600/40 touch-manipulation"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>
    );
  };

  const renderResultsTab = () => {
    const qualResults = getQualificationResults();
    const finalResults = getFinalResults();
    const finalHeat = tournament.heats.find(h => h.type === 'final');
    const allQualsComplete = tournament.heats
      .filter(h => h.type === 'qualification')
      .every(h => h.status === 'completed');

    return (
      <div className="space-y-6">
        {/* Qualification Results */}
        <div className="bg-battle-black/30 rounded-xl p-4 border border-white/5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5 text-battle-orange" />
            Kvalifikationsresultater
          </h3>

          {qualResults.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Ingen resultater endnu</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="text-left py-2 px-3">#</th>
                    <th className="text-left py-2 px-3">Hold</th>
                    <th className="text-left py-2 px-3">Heat</th>
                    <th className="text-right py-2 px-3">Nettid</th>
                  </tr>
                </thead>
                <tbody>
                  {qualResults.map((result, idx) => {
                    const team = tournament.teams.find(t => t.id === result.teamId);
                    const isAdvancing = idx < tournament.settings.advanceToFinal;
                    return (
                      <tr
                        key={`${result.teamId}-${result.heatName}`}
                        className={`border-b border-white/5 ${
                          isAdvancing ? 'bg-green-500/10' : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-bold text-white">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: team?.color }}
                            />
                            <span className="text-white">{team?.name}</span>
                            {isAdvancing && (
                              <span className="text-green-400 text-xs">FINALE</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-gray-400">{result.heatName}</td>
                        <td className="py-2 px-3 text-right font-mono text-white">
                          {formatTime(result.netTime)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {allQualsComplete && finalHeat && finalHeat.teamIds.length === 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={advanceToFinal}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors touch-manipulation"
              >
                Send Top {tournament.settings.advanceToFinal} til Finale
              </button>
            </div>
          )}
        </div>

        {/* Final Results */}
        {finalResults.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl p-4 border border-yellow-500/30">
            <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              FINALE RESULTATER
            </h3>

            <div className="space-y-3">
              {finalResults.map((result, idx) => (
                <div
                  key={result.teamId}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    idx === 0
                      ? 'bg-yellow-500/30 border-2 border-yellow-400'
                      : idx === 1
                        ? 'bg-gray-400/20 border border-gray-400'
                        : idx === 2
                          ? 'bg-amber-700/30 border border-amber-600'
                          : 'bg-battle-grey/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                    idx === 0
                      ? 'bg-yellow-400 text-black'
                      : idx === 1
                        ? 'bg-gray-300 text-black'
                        : idx === 2
                          ? 'bg-amber-600 text-white'
                          : 'bg-battle-grey text-white'
                  }`}>
                    {result.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: result.team?.color }}
                      />
                      <span className="text-white font-bold text-lg">{result.team?.name}</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      Straffe: {result.penalties} ({result.penalties * tournament.settings.penaltySeconds}s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-white">
                      {formatTime(result.netTime)}
                    </div>
                    <div className="text-gray-500 text-xs">Nettid</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export */}
        <div className="flex justify-center gap-4">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors touch-manipulation"
          >
            <Download className="w-5 h-5" />
            Eksporter CSV
          </button>
          <button
            onClick={() => setFullscreenLeaderboard(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors touch-manipulation"
          >
            <Maximize2 className="w-5 h-5" />
            Fuldskærm
          </button>
        </div>
      </div>
    );
  };

  // ============ Fullscreen Leaderboard Modal ============
  const renderFullscreenLeaderboard = () => {
    if (!fullscreenLeaderboard) return null;

    const finalResults = getFinalResults();
    const qualResults = getQualificationResults();
    const results = finalResults.length > 0 ? finalResults : qualResults.slice(0, 8).map((r, idx) => ({
      ...r,
      rank: idx + 1,
      team: tournament.teams.find(t => t.id === r.teamId),
      penalties: 0,
    }));

    return (
      <div
        className="fixed inset-0 bg-battle-black z-50 flex flex-col items-center justify-center p-8"
        onClick={() => setFullscreenLeaderboard(false)}
      >
        <h1 className="text-4xl tablet:text-6xl font-bold text-white mb-8">
          {finalResults.length > 0 ? 'FINALE RESULTATER' : 'STILLING'}
        </h1>

        <div className="w-full max-w-4xl space-y-4">
          {results.map((result, idx) => (
            <div
              key={result.teamId}
              className={`flex items-center gap-6 p-6 rounded-2xl ${
                idx === 0
                  ? 'bg-yellow-500/30 border-2 border-yellow-400'
                  : idx === 1
                    ? 'bg-gray-400/20 border border-gray-400'
                    : idx === 2
                      ? 'bg-amber-700/30 border border-amber-600'
                      : 'bg-battle-grey/30'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold ${
                idx === 0
                  ? 'bg-yellow-400 text-black'
                  : idx === 1
                    ? 'bg-gray-300 text-black'
                    : idx === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-battle-grey text-white'
              }`}>
                {result.rank}
              </div>
              <div className="flex-1 flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: result.team?.color }}
                />
                <span className="text-white font-bold text-3xl">{result.team?.name}</span>
              </div>
              <div className="text-4xl font-mono font-bold text-white">
                {formatTime(result.netTime)}
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-500 mt-8">Klik for at lukke</p>
      </div>
    );
  };

  // ============ Main Render ============
  return (
    <div className="w-full max-w-6xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-3 tablet:p-6 backdrop-blur-sm">
        {renderCloudSync()}
        {renderTabs()}

        {activeTab === 'setup' && renderSetupTab()}
        {activeTab === 'inspection' && renderInspectionTab()}
        {activeTab === 'racing' && renderRacingTab()}
        {activeTab === 'results' && renderResultsTab()}
      </div>

      {renderFullscreenLeaderboard()}
    </div>
  );
};

export default TeamRaceScorecard;
