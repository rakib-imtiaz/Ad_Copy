import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

// Import CSS for syntax highlighting and math
import 'highlight.js/styles/github-dark.css'
import 'katex/dist/katex.min.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        rehypePlugins={[
          rehypeHighlight,
          rehypeKatex,
          rehypeRaw,
          rehypeSanitize
        ]}
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
        // Customize heading styles
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-slate-800 mb-4 mt-6 first:mt-0 leading-tight">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold text-slate-700 mb-3 mt-5 first:mt-0 leading-tight">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-slate-700 mb-2 mt-4 first:mt-0 leading-tight">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-medium text-slate-700 mb-2 mt-3 first:mt-0 leading-tight">
            {children}
          </h4>
        ),
        // Customize paragraph styles
        p: ({ children }) => (
          <p className="text-slate-700 leading-relaxed mb-3 last:mb-0 text-base">
            {children}
          </p>
        ),
        // Customize list styles with better visual hierarchy
        ul: ({ children }) => (
          <ul className="list-disc list-outside text-slate-700 mb-4 space-y-2 pl-5 marker:text-slate-500">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside text-slate-700 mb-4 space-y-2 pl-5 marker:text-slate-600 marker:font-medium">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-slate-700 leading-relaxed pl-1 text-base">
            {children}
          </li>
        ),
        // Customize code block styles
        code: ({ children, className }) => {
          const isInline = !className
          if (isInline) {
            return (
              <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono break-words">
                {children}
              </code>
            )
          }
          return (
            <code className={className}>
              {children}
            </code>
          )
        },
        pre: ({ children }) => (
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4 whitespace-pre-wrap break-words">
            {children}
          </pre>
        ),
        // Customize blockquote styles
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 mb-4 bg-slate-50 py-2 rounded-r">
            {children}
          </blockquote>
        ),
        // Customize table styles
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-slate-200 rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-slate-50">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-sm text-slate-700 border-b border-slate-200">
            {children}
          </td>
        ),
        // Customize link styles
        a: ({ href, children }) => (
          <a 
            href={href} 
            className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors break-words"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        // Customize strong and emphasis
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-800">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-700">
            {children}
          </em>
        ),
        // Customize horizontal rule
        hr: () => (
          <hr className="border-slate-200 my-6" />
        ),
        // Handle line breaks better
        br: () => (
          <br className="mb-2" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}
