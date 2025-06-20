import { type ReactNode } from "react";
import { CheckCircle, Circle } from "lucide-react";

const iconClasses = {
  checked: "text-green-600 w-3 h-3 inline mr-1 align-middle",
  unchecked: "text-gray-400 w-3 h-3 inline mr-1 align-middle",
} as const;

// ✅ チェック済み
function CheckedIcon(): React.JSX.Element {
  return <CheckCircle className={iconClasses.checked} />;
}

// ⬜ 未チェック
function UncheckedIcon(): React.JSX.Element {
  return <Circle className={iconClasses.unchecked} />;
}

export function processTaskItems(text: string): {
  children: ReactNode[];
  hasTask: boolean;
} {
  const children: ReactNode[] = [];
  let hasTask = false;

  const parts = text.split(/(\([x ]\))/);

  parts.forEach((part) => {
    switch (part) {
      case "( )":
        children.push(<UncheckedIcon key={children.length} />);
        hasTask = true;
        break;
      case "(x)":
        children.push(<CheckedIcon key={children.length} />);
        hasTask = true;
        break;
      default:
        if (part) {
          children.push(part);
        }
        break;
    }
  });

  return { children, hasTask };
}
