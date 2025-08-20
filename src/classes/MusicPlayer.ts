// src/classes/MusicPlayer.ts

export class MusicPlayer {
    private songs: HTMLAudioElement[] = [];
    private currentlyPlaying = 0;
    private playing = false;
    private repeat = true;

    constructor(files: string[]) {
        this.songs = files.map(file => new Audio(file));
        this.songs.forEach(song => {
            song.volume = 0.2;
            // Usamos .bind(this) para que 'this' se refiera a la clase
            // y no al elemento de audio cuando el evento 'ended' se dispare.
            song.addEventListener('ended', this.onEnded.bind(this));
        });
    }

    // Método para reproducir la siguiente canción de la lista
    public playNextSong(): void {
        this.pause(); // Pausamos la canción actual
        const nextIndex = this.currentlyPlaying + 1;
        const actualNextIndex = nextIndex < this.songs.length ? nextIndex : 0;
        this.playSong(actualNextIndex);
    }

    // Método para pausar la música
    public pause(): void {
        if (this.playing) {
            this.playing = false;
            console.log('pausing');
            this.songs[this.currentlyPlaying].pause();
        }
    }

    // Método para reanudar la reproducción
    public play(): void {
        if (!this.playing) {
            this.playing = true;
            this.songs[this.currentlyPlaying].play();
        }
    }

    // Método que se ejecuta al finalizar una canción
    private onEnded(): void {
        if (this.repeat) {
            this.playNextSong();
        }
    }

    // Método para reproducir una canción específica por su índice
    public playSong(index: number): void {
        if (index >= 0 && index < this.songs.length) {
            this.pause(); // Pausa la canción actual si hay alguna sonando
            this.currentlyPlaying = index;
            this.songs[index].currentTime = 0; // Reinicia la canción al principio
            this.songs[index].play();
            this.playing = true;
        } else {
            console.error(`Índice de canción no válido: ${index}`);
        }
    }

    // Método para actualizar la propiedad de repetición
    public setRepeat(value: boolean): void {
        this.repeat = value;
    }
}