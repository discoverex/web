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

interface Category {
  id: string;
  label: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
}) => {
  return (
    <div className="max-w-xs mx-auto mb-10 relative">
      <label
        htmlFor="category-select"
        className="block text-center text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2"
      >
        Select Category
      </label>
      <select
        id="category-select"
        value={selectedCategoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-3 font-bold shadow-lg appearance-none cursor-pointer focus:border-amber-500 focus:outline-none transition-all"
      >
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.label}
          </option>
        ))}
      </select>
      <div className="absolute right-5 bottom-4 pointer-events-none text-zinc-400">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  );
};
