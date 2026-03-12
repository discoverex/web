import React from "react";

export const MagicEyeHeader: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-5xl font-extrabold mb-4 text-amber-500 tracking-tighter">
        MAGI-EYE CHALLENGE
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-lg">
        이미지 속에 숨겨진 정답을 찾아 클릭하세요!
      </p>
    </header>
  );
};
