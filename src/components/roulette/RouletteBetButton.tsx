// src/components/RouletteBetButton.tsx

import type { RouletteBetButtonProps } from "@/lib/types";

const getChipImageSrc = (totalBet: number): string => {
  if (totalBet >= 1000) {
    return "/res/ChipOrange.svg";
  } else if (totalBet >= 500) {
    return "/res/ChipBlueDark.svg";
  } else if (totalBet >= 200) {
    return "/res/ChipRed.svg";
  } else if (totalBet >= 100) {
    return "/res/ChipGreen.svg";
  } else {
    return "/res/ChipBlueLight.svg";
  }
};

export const RouletteBetButton = ({
  label,
  totalBet,
  onClick,
  isDisabled = false,
  className,
}: RouletteBetButtonProps) => {
  const showChip = totalBet > 0;
  const chipImageSrc = getChipImageSrc(totalBet);

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`
        relative
        flex items-center justify-center
        transition-colors duration-200
        ${
          !isDisabled
            ? "cursor-pointer"
            : "cursor-not-allowed bg-gray-800 opacity-50"
        }
        ${className}
      `}
    >
      <span className="absolute inset-0 z-10 flex items-center justify-center font-extrabold text-white text-xl">
        {label}
      </span>

      {showChip && (
        <div
          className="absolute z-20 w-12 h-12 rounded-full border-2 border-white flex items-center justify-center transition-all duration-300"
          style={{
            transform: "translateY(0%) scale(1.1)",
            backgroundImage: `url(${chipImageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <span className="text-xs font-bold text-white z-30">{totalBet}</span>
        </div>
      )}
    </div>
  );
};
