import { type ReactNode } from "react";
import { CheckedIcon, UncheckedIcon } from "./icon";
import { processText } from "./text";

const TASK_REGEX = /(\([x ]\))/;

/**
 * タスク記法（( ) / (x)）をアイコンに変換
 * @param text - 変換対象のテキスト
 * @returns 変換結果とタスクの有無
 */
export function processTaskItems(text: string): { children: ReactNode[]; hasTask: boolean } {
  const children: ReactNode[] = [];
  let hasTask = false;

  const parts = text.split(TASK_REGEX);
  
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
          children.push(...processText(part));
        }
        break;
    }
  });

  return { children, hasTask };
}