import { CheckCircle, Circle } from "lucide-react";

const ICON_CLASSES = {
  checked: "text-green-600 w-3 h-3 inline mr-1 align-middle",
  unchecked: "text-gray-400 w-3 h-3 inline mr-1 align-middle",
} as const;

// ✅ チェック済みタスクアイコン
export function CheckedIcon(): React.JSX.Element {
  return <CheckCircle className={ICON_CLASSES.checked} />;
}

// ⬜ 未チェックタスクアイコン
export function UncheckedIcon(): React.JSX.Element {
  return <Circle className={ICON_CLASSES.unchecked} />;
}