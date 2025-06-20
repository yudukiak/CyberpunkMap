import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkRuby from "~/lib/react-markdown/plugins/ruby";
import remarkLineFeedBreaks from "~/lib/react-markdown/plugins/line-feed-breaks";
import { markdownComponents } from "~/lib/react-markdown/components";

type MarkdownProps = {
  markdown: string;
};

export default function Markdown({ markdown }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkLineFeedBreaks,
        remarkBreaks,
        remarkGfm,
        remarkRuby,
      ]}
      components={markdownComponents()}
    >
      {markdown}
    </ReactMarkdown>
  );
}
