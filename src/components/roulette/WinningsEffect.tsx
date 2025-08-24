// src/components/WinningsEffect.tsx

interface WinningsEffectProps {
  amount: number;
}

export const WinningsEffect = ({ amount }: WinningsEffectProps) => {
  // Retornar un div con una animación de billetes
  return (
    <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-4 h-8 bg-green-500 rounded opacity-0 animate-bill-fall"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random()}s`,
          }}
        ></div>
      ))}
      {/* Opcional: Mensaje de "Has ganado" grande y animado */}
      <div className="absolute inset-0 flex items-center justify-center text-5xl font-extrabold text-white animate-fade-in-out">
        ¡HAS GANADO ${amount}!
      </div>
    </div>
  );
};
