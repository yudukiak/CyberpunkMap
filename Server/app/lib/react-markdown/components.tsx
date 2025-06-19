import React, { type ReactNode } from "react";
import type { Components } from "react-markdown";
import { CheckCircle, Circle } from "lucide-react";

// ============================================================================
// 定数定義
// ============================================================================

const RUBY_REGEX = /｜(.+?)《(.+?)》/g;
const TASK_REGEX = /(\([x ]\))/;

const ICON_CLASSES = {
  checked: "text-green-600 w-3 h-3 inline mr-1 align-middle",
  unchecked: "text-gray-400 w-3 h-3 inline mr-1 align-middle",
} as const;

const RUBY_CLASSES = {
  container: "text-sm",
  ruby: "text-xs text-gray-500",
} as const;

// ============================================================================
// アイコンコンポーネント
// ============================================================================

/**
 * ✅ チェック済みタスクアイコン
 */
function CheckedIcon(): React.JSX.Element {
  return <CheckCircle className={ICON_CLASSES.checked} />;
}

/**
 * ⬜ 未チェックタスクアイコン
 */
function UncheckedIcon(): React.JSX.Element {
  return <Circle className={ICON_CLASSES.unchecked} />;
}

// ============================================================================
// ルビ処理ユーティリティ
// ============================================================================

/**
 * ルビ記法（｜漢字《かな》）をHTMLのrubyタグに変換
 * @param text - 変換対象のテキスト
 * @returns 変換されたReactNode配列
 */
function parseRuby(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = RUBY_REGEX.exec(text)) !== null) {
    const [fullMatch, base, ruby] = match;
    const matchIndex = match.index;

    // ルビの前のテキストを追加
    if (lastIndex < matchIndex) {
      result.push(text.slice(lastIndex, matchIndex));
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
    result.push(text.slice(lastIndex));
  }

  return result;
}

/**
 * 任意のHTMLタグにルビ処理を適用する高階関数
 * @param tag - HTMLタグ名
 * @returns ルビ処理付きコンポーネント
 */
function withRubySupport(tag: string) {
  return function RubySupportedComponent({ children }: { children?: ReactNode }) {
    return React.createElement(
      tag,
      {},
      React.Children.map(children, (child, i) =>
        typeof child === "string" ? (
          <React.Fragment key={i}>{parseRuby(child)}</React.Fragment>
        ) : (
          child
        )
      )
    );
  };
}

// ============================================================================
// タスク処理ユーティリティ
// ============================================================================

/**
 * タスク記法（( ) / (x)）をアイコンに変換
 * @param text - 変換対象のテキスト
 * @returns 変換結果とタスクの有無
 */
function processTaskItems(text: string): { children: ReactNode[]; hasTask: boolean } {
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
          children.push(...parseRuby(part));
        }
        break;
    }
  });

  return { children, hasTask };
}

// ============================================================================
// マークダウンコンポーネント定義
// ============================================================================

/**
 * カスタムマークダウンコンポーネントを生成
 * @param components - 追加のコンポーネント
 * @returns カスタマイズされたコンポーネント
 */
export function markdownComponents(components: Components = {}): Components {
  return {
    ...components,

    // リンク（外部リンク用）
    a({ children, ...props }) {
      return (
        <a {...props} target="_blank" rel="noopener noreferrer">
          {React.Children.map(children, (child, i) =>
            typeof child === "string" ? (
              <React.Fragment key={i}>{parseRuby(child)}</React.Fragment>
            ) : (
              child
            )
          )}
        </a>
      );
    },

    // リストアイテム（タスク記法対応）
    li({ children }) {
      const processedChildren: ReactNode[] = [];
      let hasTask = false;

      React.Children.forEach(children, (child) => {
        if (typeof child === "string") {
          const { children: taskChildren, hasTask: childHasTask } = processTaskItems(child);
          processedChildren.push(...taskChildren);
          hasTask = hasTask || childHasTask;
        } else {
          processedChildren.push(child);
        }
      });

      const className = hasTask ? "" : "ml-4 list-disc";
      return <li className={className}>{processedChildren}</li>;
    },

    // ルビ対応コンポーネント
    p: withRubySupport("p"),
    em: withRubySupport("em"),
    strong: withRubySupport("strong"),
    del: withRubySupport("del"),
    blockquote: withRubySupport("blockquote"),
    h1: withRubySupport("h1"),
    h2: withRubySupport("h2"),
    h3: withRubySupport("h3"),
    h4: withRubySupport("h4"),
    h5: withRubySupport("h5"),
    h6: withRubySupport("h6"),
    th: withRubySupport("th"),
    td: withRubySupport("td"),

    // コード系（ルビ変換除外）
    code({ children, ...props }) {
      return <code {...props}>{children}</code>;
    },
    pre({ children, ...props }) {
      return <pre {...props}>{children}</pre>;
    },
  };
}
