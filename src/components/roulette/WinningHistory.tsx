import type { WinningHistoryProps } from "@/lib/types";

export const WinningHistory = ({
  winningNumberHistory,
}: WinningHistoryProps) => {
  if (winningNumberHistory.length === 0) {
    return null;
  }

  const reversedHistory = [...winningNumberHistory].reverse();

  return (
    <div className="absolute top-28 left-4 px-2 py-1 bg-gray-800 rounded-md border-2 border-yellow-500 shadow-lg">
      <ul className="flex flex-row gap-1">
        {reversedHistory.map((item, i) => (
          <li
            key={i}
            className={`w-10 h-10 flex items-center justify-center font-bold text-white rounded-md 
              ${
                i === reversedHistory.length - 1
                  ? "border-2 border-white scale-z-200 animate-pulse"
                  : ""
              }
              ${
                item.color === "green"
                  ? "bg-green-600"
                  : item.color === "red"
                  ? "bg-red-600"
                  : "bg-black"
              }`}
          >
            {item.number}
          </li>
        ))}
      </ul>
    </div>
  );
};
