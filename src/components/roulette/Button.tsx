import type { ButtonProps } from "@/lib/types";

export const Button = ({
  imageURL,
  size = 48,
  label,
  onClick,
  isDisabled = false,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
                flex flex-col items-center gap-1 p-2 rounded-lg
                text-white transition-colors duration-200
                ${
                  isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }
            `}
    >
      <img
        src={imageURL}
        alt={label || "button icon"}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      {label && <span className="font-medium">{label}</span>}
    </button>
  );
};
