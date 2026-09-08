import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-2 leading-relaxed [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.95em] dark:[&_code]:bg-white/15">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-xl bg-neutral-950 p-3 text-sm text-neutral-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-neutral-100">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5">{children}</ol>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
