import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import type { GameMode, Player } from './lib/types';
import { Menu } from './components/roulette/RouletteMenu';
import { RouletteGame } from './components/roulette/RouletteGame';
import { MusicPlayer } from './classes/MusicPlayer';
import { SoundPlayer } from './classes/SoundPlayer'; 
import { LoadingScreen } from './components/roulette/LoadingScreen';

// Inicializa las clases de audio una sola vez fuera del componente
const music = new MusicPlayer(['./res/music/background-biscuit-bliss.mp3', './res/music/background-jazz.mp3']);
const sounds = new SoundPlayer(); 

const App = () => {
    const [loading, setLoading] = useState(true);
    const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>(undefined);
    const [loadedAmount, setLoadedAmount] = useState(0);
    const navigate = useNavigate();
    const isFirstLoad = useRef(true);

    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(sounds.getIsMuted());

    useEffect(() => {
        if (!isFirstLoad.current) {
            return;
        }
        isFirstLoad.current = false;
        
        const loadResources = async () => {
            const imageUrls = [
                './res/Logo.svg',
                './res/ThumbnailSingle.webp',
                './res/ThumbnailTournament.webp'
            ];
            const imagePromises = imageUrls.map(url => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = url;
                    img.src = url;
                    img.onload = resolve;
                    img.onerror = reject;
                });
            });

            for (let i = 0; i < imageUrls.length; i++) {
                await imagePromises[i];
                const progress = (i + 1) / imageUrls.length;
                setLoadedAmount(progress);
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            
            setLoading(false);
            navigate('/menu');

            const handleFirstClick = () => {
                music.playSong(0);
                setIsMusicPlaying(true);
                document.removeEventListener('click', handleFirstClick);
            };
            document.addEventListener('click', handleFirstClick);
        };

        loadResources();
    }, [navigate]);

    const handleSelectMode = (mode: GameMode) => {
        navigate(`/${mode}`);
    };

    const handleLogin = (player: Player) => {
        setCurrentPlayer(player);
    };

    const toggleMusic = () => {
        if (isMusicPlaying) {
            music.pause(); // ✅ Llama al método pause() de MusicPlayer
        } else {
            music.playSong(0); // ✅ Llama al método playSong() de MusicPlayer
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    const toggleMute = () => {
        sounds.toggleMute();
        setIsMuted(sounds.getIsMuted());
    };

    if (loading) {
        return (
            <LoadingScreen
                logoUrl='./res/Logo.svg'
                loadedAmount={loadedAmount}
                onLoaded={() => {}}
            />
        );
    }
    
    return (
        <div className='w-full h-screen flex justify-center items-center text-white'>
            <Routes>
                <Route path="/menu" element={<Menu onSelectMode={handleSelectMode} onLogin={handleLogin} />} />
                <Route
                    path="/single"
                    element={<RouletteGame
                        mode="single"
                        player={currentPlayer}
                        musicController={{ toggleMusic, isMusicPlaying }}
                        soundController={{ toggleMute, isMuted, playSound: sounds.playSound.bind(sounds) }}
                    />}
                />
                <Route
                    path="/tournament"
                    element={<RouletteGame
                        mode="tournament"
                        player={currentPlayer}
                        musicController={{ toggleMusic, isMusicPlaying }}
                        soundController={{ toggleMute, isMuted, playSound: sounds.playSound.bind(sounds) }}
                    />}
                />
                <Route path="/" element={<Menu onSelectMode={handleSelectMode} onLogin={handleLogin} />} />
            </Routes>
        </div>
    );
};

export default App;