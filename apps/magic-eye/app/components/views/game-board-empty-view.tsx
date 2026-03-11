import React from "react";

export const GameBoardEmptyView: React.FC = () => {
  return (
    <section className="lg:col-span-4 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[700px] relative overflow-hidden">
      <div className="text-center p-20">
        <div className="mb-10 text-9xl animate-bounce drop-shadow-2xl">
          🦖
        </div>
        <h3 className="text-4xl font-black mb-4 tracking-tighter">
          준비 되셨나요?
        </h3>
        <p className="opacity-50 text-lg max-w-md mx-auto">
          카테고리를 선택하고 왼쪽 리스트에서 문제를 골라 숨겨진 비밀을
          찾아보세요!
        </p>
      </div>
    </section>
  );
};
