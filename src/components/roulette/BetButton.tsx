
const getChipColorClass = (betAmount) => {
    if (betAmount >= 1000) return 'chip-orange';
    if (betAmount >= 500) return 'chip-blue-dark';
    if (betAmount >= 200) return 'chip-red';
    if (betAmount >= 100) return 'chip-green';
    return 'chip-blue-light';
};

const BetButton = ({ number, betAmount, onPlaceBet, colorClass }) => {
    const hasBet = betAmount > 0;
    const chipColorClass = getChipColorClass(betAmount);

    return (
        <button
            onClick={onPlaceBet}
            className={`relative w-12 h-12 flex items-center justify-center font-bold text-white border border-gray-500 ${colorClass}`}
        >
            {number}
            {hasBet && (
                <div className={`absolute w-8 h-8 rounded-full flex items-center justify-center transform scale-100 transition-transform duration-300 ${chipColorClass}`}>
                    <span className="text-xs">{betAmount}</span>
                </div>
            )}
        </button>
    );
};

export default BetButton;