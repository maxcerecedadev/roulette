// src/hooks/useSoundController.ts
import { useEffect, useState } from "react";
import { SoundPlayer } from "@/classes/SoundPlayer";

// ⚡ instancia única de SoundPlayer (singleton)
const soundPlayer = new SoundPlayer();

export function useSoundController() {
  const [isMuted, setIsMuted] = useState<boolean>(soundPlayer.getIsMuted());

  useEffect(() => {
    soundPlayer
      .loadSounds()
      .then(() => setIsMuted(soundPlayer.getIsMuted()))
      .catch((err) => console.warn("No se cargaron sonidos:", err));
  }, []);

  const toggleMute = () => {
    soundPlayer.toggleMute();
    setIsMuted(soundPlayer.getIsMuted());
  };

  const playSound = (name: string) => {
    soundPlayer.playSound(name);
  };

  return {
    isMuted,
    toggleMute,
    playSound,
  };
}
