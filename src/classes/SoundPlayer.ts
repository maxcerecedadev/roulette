export class SoundPlayer {
  private sounds: Record<string, HTMLAudioElement>;
  private isMuted: boolean = false;

  constructor() {
    this.sounds = {
      chip: new Audio("/res/sounds/chip.mp3"),
      button: new Audio("/res/sounds/button.mp3"),
      spin: new Audio("/res/sounds/spin.mp3"),
      win: new Audio("/res/sounds/win.mp3"),
      lose: new Audio("/res/sounds/lose.mp3"),
      clock: new Audio("/res/sounds/clock.mp3"),
    };
  }

  public async loadSounds(): Promise<void> {
    const soundPromises = Object.keys(this.sounds).map((key) => {
      return new Promise<void>((resolve, reject) => {
        const sound = this.sounds[key];
        sound.addEventListener("canplaythrough", () => resolve(), {
          once: true,
        });
        sound.addEventListener(
          "error",
          (e) =>
            reject(
              `Error al cargar el sonido ${key}: ${(e as ErrorEvent).message}`
            ),
          { once: true }
        );
        sound.load();
      });
    });

    await Promise.all(soundPromises);
  }

  public playSound(name: string): void {
    const key = name.toLowerCase();
    const sound = this.sounds[key];
    if (!this.isMuted && sound) {
      sound.currentTime = 0;
      sound.play().catch((err) => {
        console.error(`No se pudo reproducir ${key}:`, err);
      });
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    for (const key in this.sounds) {
      this.sounds[key].muted = this.isMuted;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}
