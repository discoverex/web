"use client";

import React, { useState, useEffect } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";
const CATEGORIES = ["dinosaur", "elephant", "guitar", "rocket"];

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

export default function MagicEyeGame() {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0],
  );
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImageData, setSelectedImageData] = useState<ImageData | null>(
    null,
  );
  const [answers, setAnswers] = useState<AnswerOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. 카테고리가 변경될 때마다 이미지 목록 불러오기
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      setSelectedImageData(null);

      try {
        const prefix = `magic-eye/${selectedCategory}`;
        const response = await fetch(
          `${API_BASE_URL}/media/images-list?prefix=${prefix}`,
        );

        if (!response.ok)
          throw new Error(
            `${selectedCategory} 목록을 불러오는데 실패했습니다.`,
          );

        const json = await response.json();

        if (json.status === "success" && Array.isArray(json.data)) {
          const filtered = json.data.filter((item: ImageData) =>
            item.name.includes("prob"),
          );
          setImages(filtered);
        } else {
          setImages([]);
          if (json.status !== "success")
            throw new Error(
              json.message || "데이터를 가져오는데 실패했습니다.",
            );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "알 수 없는 에러가 발생했습니다.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [selectedCategory]);

  // 2. 이미지가 선택될 때 정답 선택지 생성 (백엔드 API 대신 시뮬레이션)
  useEffect(() => {
    if (selectedImageData) {
      const labels = ["티라노사우루스", "트리케라톱스", "브라키오사우루스", "스테고사우루스", "벨로키라토르"];
      const dummyAnswers = labels.map((label, i) => ({
        id: `ans-${i}`,
        label,
        // 나중에 실제 이미지 경로로 교체될 부분입니다. 테스트를 위해 플레이스홀더 이미지를 사용합니다.
        imageUrl: `https://picsum.photos/seed/${label}/200`, 
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        duration: 10 + Math.random() * 10,
        delay: -Math.random() * 20,
      }));
      setAnswers(dummyAnswers);
    } else {
      setAnswers([]);
    }
  }, [selectedImageData]);

  // 3. 5초마다 정답 선택지들의 위치를 무작위로 변경
  useEffect(() => {
    if (!selectedImageData || answers.length === 0) return;

    const moveInterval = setInterval(() => {
      setAnswers((prevAnswers) =>
        prevAnswers.map((ans) => ({
          ...ans,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
        }))
      );
    }, 5000); // 5초마다 위치 이동

    return () => clearInterval(moveInterval);
  }, [selectedImageData, answers.length]);

  return (
    <div className="min-h-screen p-8 font-sans bg-zinc-50 dark:bg-black text-black dark:text-white">
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -30px) rotate(5deg); }
          50% { transform: translate(-10px, -50px) rotate(-5deg); }
          75% { transform: translate(-30px, -20px) rotate(3deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-float {
          animation: float var(--float-duration) ease-in-out infinite;
          animation-delay: var(--float-delay);
          transition: left 4s ease-in-out, top 4s ease-in-out;
        }
      `}</style>

      <header className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-amber-500 tracking-tighter">
          MAGI-EYE CHALLENGE
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
          이미지 속에 숨겨진 정답을 찾아 클릭하세요!
        </p>
      </header>

      {/* 카테고리 선택 탭 */}
      <nav className="max-w-6xl mx-auto mb-10 flex justify-center gap-3 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-md border-2 ${
              selectedCategory === cat
                ? "bg-amber-500 text-white border-amber-500 scale-105"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-300"
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </nav>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* 왼쪽: 이미지 목록 */}
        <aside className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-amber-500">LIST</h2>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-zinc-500 font-bold">
              {images.length}
            </span>
          </div>

          {loading && (
            <p className="text-sm opacity-70 animate-pulse text-center py-4">
              이미지 로드 중...
            </p>
          )}
          {error && <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

          <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {images.length > 0
              ? images.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => setSelectedImageData(item)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all text-xs font-mono truncate border-2 ${
                        selectedImageData?.name === item.name
                          ? "bg-amber-500 text-white border-amber-500 shadow-lg"
                          : "bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent text-zinc-600 dark:text-zinc-400"
                      }`}
                      title={item.name}
                    >
                      {item.name.split("/").pop()}
                    </button>
                  </li>
                ))
              : !loading && (
                  <p className="text-sm opacity-50 italic text-center py-20">
                    이미지가 없습니다.
                  </p>
                )}
          </ul>
        </aside>

        {/* 오른쪽: 게임 화면 (확대됨) */}
        <section className="lg:col-span-4 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[700px] relative overflow-hidden">
          {selectedImageData ? (
            <div className="w-full h-full flex flex-col">
              <div className="mb-6 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <h2 className="text-base font-bold">
                  FILENAME:{" "}
                  <span className="font-mono text-amber-500">
                    {selectedImageData.name.split("/").pop()}
                  </span>
                </h2>
                <button
                  onClick={() => setSelectedImageData(null)}
                  className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                >
                  CLOSE
                </button>
              </div>

              <div className="relative flex-grow border-8 border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden cursor-pointer group flex justify-center items-center bg-zinc-200 dark:bg-zinc-950 shadow-inner min-h-[600px]">
                {/* 맴도는 정답 선택지들 (정사각형 이미지 형태) */}
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
                    {ans.imageUrl ? (
                      <img 
                        src={ans.imageUrl} 
                        alt={ans.label} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-center p-2 bg-amber-50 dark:bg-zinc-900">
                        {ans.label}
                      </div>
                    )}
                    
                    {/* 호버 시 텍스트 라벨 표시 (옵션) */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/ans:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-bold px-1 text-center">
                        {ans.label}
                      </span>
                    </div>
                  </button>
                ))}

                <img
                  src={selectedImageData.url}
                  alt="Magic Eye Problem"
                  className="max-w-full h-auto object-contain max-h-[80vh] z-10"
                  onLoad={() => console.log("이미지 로드 완료")}
                />
                
                {/* 오버레이 */}
                <div className="absolute inset-0 pointer-events-none group-hover:bg-black/5 transition-colors z-0" />
              </div>
              
              <div className="mt-6 flex justify-between items-center text-sm font-bold opacity-60">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                  이미지 속 숨겨진 물체의 사진을 클릭하세요!
                </span>
                <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl">
                  {selectedCategory.toUpperCase()} MODE
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center p-20">
              <div className="mb-10 text-9xl animate-bounce drop-shadow-2xl">🦖</div>
              <h3 className="text-4xl font-black mb-4 tracking-tighter">
                READY TO PLAY?
              </h3>
              <p className="opacity-50 text-lg max-w-md mx-auto">
                카테고리를 선택하고 왼쪽 리스트에서 문제를 골라 숨겨진 비밀을 찾아보세요!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
