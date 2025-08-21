// src/hooks/useMusicController.ts
import { useEffect, useState } from "react";
import { MusicPlayer } from "@/classes/MusicPlayer";

const music = new MusicPlayer([
  "./res/music/background-biscuit-bliss.mp3",
  "./res/music/background-jazz.mp3",
]);

export function useMusicController() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    const handleFirstClick = () => {
      music.playSong(0);
      setIsMusicPlaying(true);
      document.removeEventListener("click", handleFirstClick);
    };

    document.addEventListener("click", handleFirstClick);
    return () => document.removeEventListener("click", handleFirstClick);
  }, []);

  return {
    isMusicPlaying,
    toggleMusic: () => {
      if (isMusicPlaying) {
        music.pause();
        setIsMusicPlaying(false);
      } else {
        music.playSong(0);
        setIsMusicPlaying(true);
      }
    },
  };
}
