import React from "react";

interface GameBoardFooterViewProps {
  selectedCategoryLabel: string;
}

export const GameBoardFooterView: React.FC<GameBoardFooterViewProps> = ({
  selectedCategoryLabel,
}) => {
  return (
    <div className="mt-6 flex justify-between items-center text-sm font-bold opacity-60">
      <span className="flex items-center gap-2">
        <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
        이미지 속 숨겨진 물체의 사진을 클릭하세요!
      </span>
      <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl">
        {selectedCategoryLabel.toUpperCase()} 모드
      </span>
    </div>
  );
};
