import React from "react";
import { processBreak } from "./break";
import { processRuby } from "./ruby";

/**
 * テキスト処理のラッパー関数
 * 全てのテキスト変換処理を一元管理
 * @param text - 処理対象のテキスト
 * @returns 全ての処理が完了したReactNode配列
 */
export function processText(text: string): React.ReactNode[] {
  // 改行処理
  const breakProcessed = processBreak(text);

  // 各テキスト部分に対してルビ処理を適用
  const result: React.ReactNode[] = [];
  breakProcessed.forEach((node, index) => {
    if (typeof node === "string") {
      // 文字列の場合はルビ処理を適用
      result.push(...processRuby(node));
    } else {
      // ReactNodeの場合はそのまま追加
      result.push(React.cloneElement(node as React.ReactElement, { key: index }));
    }
  });
  
  return result;
}