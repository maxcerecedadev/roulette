// src/App.tsx
import { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import type { GameMode, Player } from "./lib/types";
import { Menu } from "./components/roulette/RouletteMenu";
import { RouletteGame } from "./components/roulette/RouletteGame";
import { LoadingScreen } from "./components/roulette/LoadingScreen";
import { TournamentComingSoon } from "./components/TournamentComingSoon";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>();
  const [loadedAmount, setLoadedAmount] = useState(0);
  const navigate = useNavigate();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!isFirstLoad.current) return;
    isFirstLoad.current = false;

    const loadResources = async () => {
      const imageUrls = [
        "./res/Logo.svg",
        "./res/ThumbnailSingle.webp",
        "./res/ThumbnailTournament.webp",
      ];

      const imagePromises = imageUrls.map(
        (url) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve();
            img.onerror = () => reject();
          })
      );

      for (let i = 0; i < imageUrls.length; i++) {
        await imagePromises[i];
        setLoadedAmount((i + 1) / imageUrls.length);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      setLoading(false);
      navigate("/menu");
    };

    loadResources();
  }, [navigate]);

  const handleSelectMode = (mode: GameMode) => {
    navigate(`/${mode}`);
  };

  const handleLogin = (player: Player) => {
    setCurrentPlayer(player);
  };

  if (loading) {
    return (
      <LoadingScreen
        logoUrl="./res/Logo.svg"
        loadedAmount={loadedAmount}
        onLoaded={() => {}}
      />
    );
  }

  return (
    <div className="w-full h-screen flex justify-center items-center text-white">
      <Routes>
        <Route
          path="/menu"
          element={
            <Menu onSelectMode={handleSelectMode} onLogin={handleLogin} />
          }
        />
        <Route
          path="/single"
          element={<RouletteGame mode="single" player={currentPlayer} />}
        />
        <Route path="/tournament" element={<TournamentComingSoon />} />
        <Route
          path="/"
          element={
            <Menu onSelectMode={handleSelectMode} onLogin={handleLogin} />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
