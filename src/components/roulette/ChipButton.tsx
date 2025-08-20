// src/components/ChipButton.tsx
import React from 'react';

interface ChipButtonProps {
    amount: number;
    imageURL: string;
    onClick: (amount: number) => void;
    isSelected: boolean;
}

export const ChipButton: React.FC<ChipButtonProps> = ({
    amount,
    imageURL,
    onClick,
    isSelected,
}) => {
    const SIZE_PX = 104;

    const chipClasses = `
        relative
        flex items-center justify-center
        rounded-full
        transition-transform duration-200
        ${isSelected ? 'transform scale-110 ring-4 ring-yellow-400' : 'transform scale-100 hover:scale-105'}
    `;

    return (
        <button
            onClick={() => onClick(amount)}
            className={chipClasses}
            style={{ width: `${SIZE_PX}px`, height: `${SIZE_PX}px` }}
        >
            <img
                src={imageURL}
                alt={`Ficha de ${amount}`}
                className="absolute inset-0 rounded-full w-full h-full object-cover"
            />
            <span className="relative z-10 text-white font-bold text-2xl">
                {amount}
            </span>
        </button>
    );
};