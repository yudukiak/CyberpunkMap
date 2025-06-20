import React, { type ReactNode } from "react";
import type { Components } from "react-markdown";
import { processTaskItems } from "./utils/task-items";

export function markdownComponents(components: Components = {}): Components {
  return {
    ...components,

    // リンク（外部リンク用）
    a({ children, ...props }) {
      return (
        <a {...props} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },

    // リストアイテム（タスク記法対応）
    li({ children }) {
      const processedChildren: ReactNode[] = [];
      let hasTask = false;

      React.Children.forEach(children, (child) => {
        if (typeof child === "string") {
          const { children: taskChildren, hasTask: childHasTask } =
            processTaskItems(child);
          processedChildren.push(...taskChildren);
          hasTask = hasTask || childHasTask;
        } else {
          processedChildren.push(child);
        }
      });

      const className = hasTask ? "" : "ml-4 list-disc";
      return <li className={className}>{processedChildren}</li>;
    },
  };
}
