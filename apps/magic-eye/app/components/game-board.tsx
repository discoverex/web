import React, { useState, useEffect } from "react";

interface ImageData {
  name: string;
  url: string;
}

interface AnswerOption {
  id: string;
  label: string;
  imageUrl?: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

interface AiHint {
  label: string;
  score: number;
}

interface GameBoardProps {
  selectedImageData: ImageData | null;
  answers: AnswerOption[];
  onClose: () => void;
  selectedCategoryLabel: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  selectedImageData,
  answers,
  onClose,
  selectedCategoryLabel,
}) => {
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiHint, setAiHint] = useState<AiHint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiLevel, setAiLevel] = useState<number>(5);

  useEffect(() => {
    setAiHint(null);
    setError(null);
  }, [selectedImageData?.url]);

  const getAiHint = async () => {
    if (!selectedImageData) return;

    setAiLoading(true);
    setAiHint(null);
    setError(null);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: selectedImageData.url,
          level: aiLevel,
        }),
      });

      if (!response.ok) {
        throw new Error("서버로부터 AI 분석 결과를 가져오지 못했습니다.");
      }

      const result = await response.json();

      if (Array.isArray(result) && result.length > 0) {
        const topResult = result[0];
        setAiHint({
          label: topResult.label,
          score: topResult.score,
        });
      } else {
        setError("AI 분석 결과를 가져올 수 없습니다.");
      }
    } catch (err) {
      console.error("AI 훈수 실패:", err);
      setError("AI 분석 중 에러가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!selectedImageData) {
    return (
      <section className="lg:col-span-4 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[700px] relative overflow-hidden">
        <div className="text-center p-20">
          <div className="mb-10 text-9xl animate-bounce drop-shadow-2xl">🦖</div>
          <h3 className="text-4xl font-black mb-4 tracking-tighter">준비 되셨나요?</h3>
          <p className="opacity-50 text-lg max-w-md mx-auto">
            카테고리를 선택하고 왼쪽 리스트에서 문제를 골라 숨겨진 비밀을 찾아보세요!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="lg:col-span-4 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[700px] relative overflow-hidden">
      <div className="w-full h-full flex flex-col">
        <div className="mb-6 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col">
            <h2 className="text-base font-bold">
              파일명:{" "}
              <span className="font-mono text-amber-500">
                {selectedImageData.name.split("/").pop()}
              </span>
            </h2>
            {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-4">
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">레벨</span>
              <select 
                value={aiLevel}
                onChange={(e) => setAiLevel(Number(e.target.value))}
                className="bg-zinc-100 dark:bg-zinc-800 text-xs px-2 py-1 rounded-md font-bold focus:outline-none"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
            </div>

            <button
              onClick={getAiHint}
              disabled={aiLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                aiLoading
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 active:scale-95"
              }`}
            >
              {aiLoading ? "🤖 AI 분석 중..." : "🤖 AI 훈수 듣기"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="relative flex-grow border-8 border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden cursor-pointer group flex justify-center items-center bg-zinc-200 dark:bg-zinc-950 shadow-inner min-h-[600px]">
          {aiHint && (
            <div className="absolute top-10 right-10 z-30 flex items-end gap-3 animate-hint">
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-2xl border-2 border-purple-500 max-w-xs relative">
                <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  "레벨 {aiLevel} 모델로 분석한 결과야! 여기 <span className="underline decoration-2 decoration-purple-300 font-black text-lg">'{aiHint.label}'</span> 모양이 있는 것 같아."
                </p>
                <p className="text-[10px] mt-2 opacity-50 font-mono text-right">
                  모델: ai_lv{aiLevel}.onnx
                </p>
                <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white dark:bg-zinc-800 border-r-2 border-b-2 border-purple-500 rotate-45" />
              </div>
              <div className="text-4xl filter drop-shadow-lg">🦖</div>
            </div>
          )}

          {answers.map((ans) => (
            <button
              key={ans.id}
              className="absolute z-20 w-24 h-24 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border-4 border-amber-500/50 overflow-hidden hover:scale-110 hover:border-amber-500 transition-all animate-float pointer-events-auto group/ans"
              style={{
                left: `${ans.x}%`,
                top: `${ans.y}%`,
                // @ts-ignore
                "--float-duration": `${ans.duration}s`,
                "--float-delay": `${ans.delay}s`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                alert(`정답! ${ans.label}을(를) 찾으셨나요?`);
              }}
            >
              {ans.imageUrl && (
                <img src={ans.imageUrl} alt={ans.label} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/ans:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-bold px-1 text-center">{ans.label}</span>
              </div>
            </button>
          ))}

          <img
            src={selectedImageData.url}
            alt="Magic Eye Problem"
            className="max-w-full h-auto object-contain max-h-[80vh] z-10"
          />
          <div className="absolute inset-0 pointer-events-none group-hover:bg-black/5 transition-colors z-0" />
        </div>

        <div className="mt-6 flex justify-between items-center text-sm font-bold opacity-60">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
            이미지 속 숨겨진 물체의 사진을 클릭하세요!
          </span>
          <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl">
            {selectedCategoryLabel.toUpperCase()} 모드
          </span>
        </div>
      </div>
    </section>
  );
};
