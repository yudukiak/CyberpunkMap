import { useState } from "react";
import { FaSearch } from "react-icons/fa";

type SearchProps = {
  colorState: Record<string, boolean>;
  setColorState: (next: Record<string, boolean>) => void;
};

export default function Search({ colorState, setColorState }: SearchProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed top-2.5 right-2.5 z-[401] w-7.5 h-7.5">
        <button
          onClick={() => setOpen(true)}
          className="bg-white hover:bg-[#f4f4f4] h-full w-full flex items-center justify-center rounded-xs cursor-pointer"
        >
          <FaSearch />
        </button>
      </div>
      {open && (
        <SearchModal
          onClose={() => setOpen(false)}
          colorState={colorState}
          onSubmit={(next) => {
            setColorState(next);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

type SearchModalProps = {
  onClose: () => void;
  colorState: Record<string, boolean>;
  onSubmit: (next: Record<string, boolean>) => void;
};

function SearchModal({ onClose, colorState, onSubmit }: SearchModalProps) {
  const [localState, setLocalState] = useState(colorState);

  const toggle = (color: string) => {
    setLocalState((prev) => ({
      ...prev,
      [color]: !prev[color],
    }));
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black/50 z-[1001]"
      onClick={onClose}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xs p-4 w-11/12 max-w-[480px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">ピンの色で絞り込み</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.keys(localState).map((color) => (
            <label key={color} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localState[color]}
                onChange={() => toggle(color)}
              />
              <span className="capitalize">{color}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded-xs"
          >
            閉じる
          </button>
          <button
            onClick={() => onSubmit(localState)}
            className="bg-red-600 text-white px-4 py-2 rounded-xs"
          >
            検索
          </button>
        </div>
      </div>
    </div>
  );
}
