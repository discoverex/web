'use client';

import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  left: string;
  backgroundColor: string;
  animationDelay: string;
  animationDuration: string;
  transform: string;
  size: string;
}

const ConfettiEffect = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    // 클라이언트 마운트 시점에 한 번만 랜덤 값을 생성하여
    // 서버/클라이언트 간의 Hydration Mismatch 및 리렌더링 시의 불안정성을 방지합니다.
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffa500'];
    const newPieces = [...Array(80)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)] || '#ff0000',
      animationDelay: `${Math.random() * 4}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
      size: `${5 + Math.random() * 8}px`,
    }));
    setPieces(newPieces);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti"
          style={{
            left: p.left,
            backgroundColor: p.backgroundColor,
            animationDelay: p.animationDelay,
            animationDuration: p.animationDuration,
            transform: p.transform,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;
