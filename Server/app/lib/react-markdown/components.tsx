import React, { type ReactNode } from "react";
import type { Components } from "react-markdown";
import { processText } from "./utils/text";
import { processTaskItems } from "./utils/task-items";

/**
 * 任意のHTMLタグにテキスト処理を適用する高階関数
 * @param tag - HTMLタグ名
 * @returns テキスト処理付きコンポーネント
 */
function withTextProcessing(tag: string) {
  return function TextProcessedComponent({ children }: { children?: ReactNode }) {
    return React.createElement(
      tag,
      {},
      React.Children.map(children, (child, i) =>
        typeof child === "string" ? (
          <React.Fragment key={i}>{processText(child)}</React.Fragment>
        ) : (
          child
        )
      )
    );
  };
}

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
              <React.Fragment key={i}>{processText(child)}</React.Fragment>
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

    // テキスト処理対応コンポーネント
    p: withTextProcessing("p"),
    em: withTextProcessing("em"),
    strong: withTextProcessing("strong"),
    del: withTextProcessing("del"),
    blockquote: withTextProcessing("blockquote"),
    h1: withTextProcessing("h1"),
    h2: withTextProcessing("h2"),
    h3: withTextProcessing("h3"),
    h4: withTextProcessing("h4"),
    h5: withTextProcessing("h5"),
    h6: withTextProcessing("h6"),
    th: withTextProcessing("th"),
    td: withTextProcessing("td"),

    // コード系（テキスト処理除外）
    code({ children, ...props }) {
      return <code {...props}>{children}</code>;
    },
    pre({ children, ...props }) {
      return <pre {...props}>{children}</pre>;
    },
  };
}
