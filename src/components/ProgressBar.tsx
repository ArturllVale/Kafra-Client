import React from 'react';

interface ProgressBarProps {
    percentage: number;
    isActive?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, isActive = false }) => {
    return (
        <div className="relative">
            {/* Background track */}
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                {/* Progress fill */}
                <div
                    className={`h-full rounded-full transition-all duration-300 ease-out relative ${percentage >= 100
                            ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400'
                            : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400'
                        }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                >
                    {/* Shimmer effect when active */}
                    {isActive && percentage < 100 && (
                        <div className="absolute inset-0 animate-shimmer" />
                    )}

                    {/* Glow effect */}
                    {percentage > 0 && percentage < 100 && (
                        <div
                            className="absolute right-0 top-0 h-full w-4 bg-gradient-to-r from-transparent to-white/30 blur-sm"
                        />
                    )}
                </div>
            </div>

            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white drop-shadow-lg">
                    {percentage.toFixed(0)}%
                </span>
            </div>
        </div>
    );
};
