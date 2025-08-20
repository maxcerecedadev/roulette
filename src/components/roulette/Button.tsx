// Define las props para el componente
interface ButtonProps {
    imageURL: string;
    size?: number;
    label?: string;
    onClick: () => void;
    isDisabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    imageURL,
    size = 48,
    label,
    onClick,
    isDisabled = false,
}) => {
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`
                flex flex-col items-center gap-1 p-2 rounded-lg
                text-white transition-colors duration-200
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
        >
            <img 
                src={imageURL} 
                alt={label || 'button icon'}
                style={{ width: `${size}px`, height: `${size}px` }}
            />
            {label && (
                <span className="font-medium">
                    {label}
                </span>
            )}
        </button>
    );
};