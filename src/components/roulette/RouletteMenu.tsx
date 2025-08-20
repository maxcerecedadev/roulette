// src/components/Menu.tsx
import type { MenuProps, Player } from "@/lib/types";
import { useState } from "react";

export const Menu = ({ onSelectMode, onLogin }: MenuProps) => {
  const [username, setUsername] = useState<string>("");

  const handleStartTournament = () => {
    if (username.trim() === "") {
      alert("Por favor, ingresa tu nombre de usuario.");
      return;
    }
    const player: Player = { name: username, score: 0 };
    onLogin(player);
    onSelectMode("tournament");
  };

  return (
    <div
      id="menu"
      className="roulette-menu flex flex-col items-center gap-4 p-8 rounded-lg"
    >
      <h1 className="text-3xl font-bold text-white mb-6">
        Selecciona un modo de juego
      </h1>
      <div id="modes-list" className="flex flex-wrap justify-center gap-4">
        {/* Modo Single Player */}
        <button
          onClick={() => onSelectMode("single")}
          className="w-64 transition-transform transform hover:scale-105"
        >
          <img
            src="./res/ThumbnailSingle.webp"
            alt="Modo Single Player"
            className="w-full rounded-lg"
          />
        </button>

        {/* Modo Tournament */}
        <div className="flex flex-col w-64 gap-2">
          <button
            onClick={() => onSelectMode("tournament")}
            className="w-full transition-transform transform hover:scale-105"
          >
            <img
              src="./res/ThumbnailTournament.webp"
              alt="Modo Torneo"
              className="w-full rounded-lg"
            />
          </button>
          <input
            type="text"
            id="name-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleStartTournament}
            className="extra w-full p-2 mt-2 bg-blue-600 text-white rounded-lg font-semibold transition-colors hover:bg-blue-700"
          >
            Play Tournament
          </button>
        </div>
      </div>
    </div>
  );
};
