import { visit } from "unist-util-visit";
import type { Root, PhrasingContent } from "mdast";

/**
 * 文字列中の "\\n" を <br> に変換する remark プラグイン
 */
export default function remarkLineFeedBreaks(): (tree: Root) => void {
  return function transformer(tree: Root): void {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;

      const value = (node as any).value as string;
      if (!value.includes("\\n")) return;

      const parts = value.split("\\n");
      const children: PhrasingContent[] = [];

      parts.forEach((part, i) => {
        if (part) {
          children.push({ type: "text", value: part });
        }

        if (i < parts.length - 1) {
          children.push({
            type: "text",
            value: "",
            data: {
              hName: "br",
              hProperties: {},
              hChildren: [],
            },
          } as unknown as PhrasingContent);
        }
      });

      parent.children.splice(index, 1, ...children);
    });
  };
}
