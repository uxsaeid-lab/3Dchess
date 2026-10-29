import { useState, useCallback } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { ClassicChessArena } from './components/game/ClassicChessArena';
import type { BotConfig } from './types/chess';

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'game'>('landing');
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);

  // Handle game start from Map Selection modal
  const handleStartGame = useCallback((bot: BotConfig, _worldId: string) => {
    setSelectedBot(bot);
    setViewMode('game');
  }, []);

  // Exit back to Landing Page
  const handleExitToLanding = useCallback(() => {
    setViewMode('landing');
  }, []);

  if (viewMode === 'landing') {
    return (
      <div className="w-screen h-screen overflow-y-auto bg-white">
        <LandingPage onStartGame={handleStartGame} />
      </div>
    );
  }

  return (
    <ClassicChessArena
      initialBotId={selectedBot?.id || 'noob'}
      onExitToLanding={handleExitToLanding}
    />
  );
}

export default App;
