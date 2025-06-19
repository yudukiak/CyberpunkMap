import React from "react";

const RUBY_REGEX = /｜(.+?)《(.+?)》/g;
const RUBY_CLASSES = {
  container: "text-sm",
  ruby: "text-xs text-gray-500",
} as const;

/**
 * ルビ記法（｜漢字《かな》）をHTMLのrubyタグに変換
 * @param text - 変換対象のテキスト
 * @returns 変換されたReactNode配列
 */
export function processRuby(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = RUBY_REGEX.exec(text)) !== null) {
    const [fullMatch, base, ruby] = match;
    const matchIndex = match.index;

    // ルビの前のテキストを追加
    if (lastIndex < matchIndex) {
      const beforeText = text.slice(lastIndex, matchIndex);
      result.push(beforeText);
    }

    // ルビ要素を追加
    result.push(
      <ruby key={matchIndex} className={RUBY_CLASSES.container}>
        {base}
        <rp>（</rp>
        <rt className={RUBY_CLASSES.ruby}>{ruby}</rt>
        <rp>）</rp>
      </ruby>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    result.push(remainingText);
  }

  return result;
}