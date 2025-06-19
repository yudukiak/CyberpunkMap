import React from "react";

const NEWLINE_REGEX = /\\n/g;

/**
 * \n を改行に変換
 * @param text - 変換対象のテキスト
 * @returns 変換されたReactNode配列
 */
export function processBreak(text: string): React.ReactNode[] {
  const parts = text.split(NEWLINE_REGEX);
  const result: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (index > 0) {
      result.push(<br key={`br-${index}`} />);
    }
    if (part) {
      result.push(part);
    }
  });

  return result;
}