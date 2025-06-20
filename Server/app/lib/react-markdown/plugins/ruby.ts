import { visit } from "unist-util-visit";
import type { Root, PhrasingContent } from "mdast";

type Options = {
  rp?: [string, string];
  rubyClass?: string;
  rtClass?: string;
};

const RUBY_REGEX = /｜(.+?)《(.+?)》/g;

/**
 * ルビ記法（｜漢字《かな》）をHTMLのrubyタグに変換するremarkプラグイン
 */
export default function remarkRuby(options?: Options) {
  const {
    rp = ["（", "）"],
    rubyClass = "text-sm",
    rtClass = "text-xs text-gray-500",
  } = options ?? {};

  return function transformer(tree: Root) {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;

      const value = (node as any).value as string;
      if (!RUBY_REGEX.test(value)) return;

      // 正規表現をリセット
      RUBY_REGEX.lastIndex = 0;

      const segments: PhrasingContent[] = [];
      let last = 0;

      for (const match of value.matchAll(RUBY_REGEX)) {
        const [full, base, ruby] = match;
        const start = match.index!;

        // ルビの前のテキストを追加
        if (last < start) {
          segments.push({ type: "text", value: value.slice(last, start) });
        }

        // ルビ要素を作成
        segments.push(createRubyElement(base, ruby, rp, rubyClass, rtClass));

        last = start + full.length;
      }

      // 残りのテキストを追加
      if (last < value.length) {
        segments.push({ type: "text", value: value.slice(last) });
      }

      // セグメントがある場合のみ置換
      if (segments.length > 0) {
        parent.children.splice(index, 1, ...segments);
      }
    });
  };
}

/**
 * ルビ要素を作成するヘルパー関数
 */
function createRubyElement(
  base: string,
  ruby: string,
  rp: [string, string],
  rubyClass: string,
  rtClass: string
): PhrasingContent {
  return {
    type: "text",
    value: "",
    data: {
      hName: "ruby",
      hProperties: { className: rubyClass },
      hChildren: [
        { type: "text", value: base },
        {
          type: "element",
          tagName: "rp",
          properties: {},
          children: [{ type: "text", value: rp[0] }],
        },
        {
          type: "element",
          tagName: "rt",
          properties: { className: rtClass },
          children: [{ type: "text", value: ruby }],
        },
        {
          type: "element",
          tagName: "rp",
          properties: {},
          children: [{ type: "text", value: rp[1] }],
        },
      ],
    },
  } as unknown as PhrasingContent;
}
