import React from "react";

interface ImageData {
  name: string;
  url: string;
}

interface ImageSidebarProps {
  images: ImageData[];
  selectedImage: ImageData | null;
  loading: boolean;
  error: string | null;
  onSelectImage: (image: ImageData) => void;
}

export const ImageSidebar: React.FC<ImageSidebarProps> = ({
  images,
  selectedImage,
  loading,
  error,
  onSelectImage,
}) => {
  return (
    <aside className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-amber-500">LIST</h2>
        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-zinc-500 font-bold">
          {images.length}
        </span>
      </div>

      {loading && (
        <p className="text-sm opacity-70 animate-pulse text-center py-4">이미지 로드 중...</p>
      )}
      {error && <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

      <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {images.length > 0 ? (
          images.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => onSelectImage(item)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all text-xs font-mono truncate border-2 ${
                  selectedImage?.name === item.name
                    ? "bg-amber-500 text-white border-amber-500 shadow-lg"
                    : "bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent text-zinc-600 dark:text-zinc-400"
                }`}
                title={item.name}
              >
                {item.name.split("/").pop()}
              </button>
            </li>
          ))
        ) : (
          !loading && <p className="text-sm opacity-50 italic text-center py-20">이미지가 없습니다.</p>
        )}
      </ul>
    </aside>
  );
};
