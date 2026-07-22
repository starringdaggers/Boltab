"use client";

import { useEffect, useState } from "react";

const CONFETTI_COLORS = ["#5483B3", "#7DA0CA", "#C1E8FF", "#052659", "#4C7A5E"];

export default function CelebrationModal({
  open,
  onClose,
  studentName,
  aggregatePercent,
}: {
  open: boolean;
  onClose: () => void;
  studentName?: string;
  aggregatePercent: number;
}) {
  const [pieces, setPieces] = useState<
    { left: number; delay: number; duration: number; color: string; rotate: number }[]
  >([]);

  useEffect(() => {
    if (!open) return;
    setPieces(
      Array.from({ length: 40 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.5 + Math.random() * 1.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotate: Math.random() * 360,
      }))
    );
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bistre/60 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {pieces.map((p, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "-5%",
              left: `${p.left}%`,
              width: 8,
              height: 14,
              backgroundColor: p.color,
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      <div className="relative bg-white rounded-card px-8 py-10 max-w-sm w-full mx-4 text-center shadow-2xl animate-[celebration-pop_0.4s_ease-out]">
        <p className="text-5xl mb-3">🎉</p>
        <h2 className="font-display text-2xl font-semibold text-bistre mb-2">
          Outstanding{studentName ? `, ${studentName.split(" ")[0]}` : ""}!
        </h2>
        <p className="text-vandyke mb-1">
          You scored <span className="font-semibold text-bistre">{aggregatePercent.toFixed(1)}%</span> this term.
        </p>
        <p className="text-vandyke text-sm mb-6">That's excellent work — keep it up!</p>
        <button
          onClick={onClose}
          className="bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-6 py-2.5 transition-colors"
        >
          Continue
        </button>
      </div>

      <style>{`
        @keyframes confetti-fall {
          to {
            top: 105%;
            transform: rotate(720deg);
          }
        }
        @keyframes celebration-pop {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
