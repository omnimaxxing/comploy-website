'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { cn } from '@/utilities/cn'

interface MarkdownRendererProps {
  content: string
}

// Custom TypeScript types for ReactMarkdown components
type CodeProps = {
  node?: any
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

// Define type for paragraph props
type ParagraphProps = {
  node?: any
  children?: React.ReactNode
  className?: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Clean up the content
  const cleanedContent = React.useMemo(() => {
    // Remove duplicate version headers if present
    let cleaned = content
      ?.replace(/^(v[0-9]+\.[0-9]+\.[0-9]+\s*\([^)]+\))\s*\n\s*v?\1\s*\([0-9]{4}-[0-9]{2}-[0-9]{2}\)/gm, '$1')
      ?.replace(/^(v[0-9]+\.[0-9]+\.[0-9]+\s*\([^)]+\))\s*\n\s*([0-9]+\.[0-9]+\.[0-9]+\s*\([0-9]{4}-[0-9]{2}-[0-9]{2}\))/gm, '$1');
      
    // Normalize emoji headings
    cleaned = cleaned
      ?.replace(/### 🚀 (Features)/g, '### 🚀 Features')
      ?.replace(/### 🐛 (Bug ?Fixes)/g, '### 🐛 Bug Fixes')
      ?.replace(/### ⚠️ (Breaking ?Changes)/g, '### ⚠️ BREAKING CHANGES')
      ?.replace(/### 📚 (Documentation)/g, '### 📚 Documentation')
      ?.replace(/### 🛠 (Refactors)/g, '### 🛠 Refactors')
      ?.replace(/### ⚡ (Performance)/g, '### ⚡ Performance')
      ?.replace(/### 🏡 (Chores)/g, '### 🏡 Chores')
      ?.replace(/### 🤝 (Contributors)/g, '### 🤝 Contributors');
      
    return cleaned;
  }, [content]);
  
  // Capture emoji headings for styling
  const categoryColors = {
    '🚀 Features': 'text-green-400',
    '🐛 Bug Fixes': 'text-orange-400',
    '⚠️ BREAKING CHANGES': 'text-red-400',
    '📚 Documentation': 'text-blue-400',
    '🛠 Refactors': 'text-purple-400',
    '⚡ Performance': 'text-yellow-400',
    '🏡 Chores': 'text-gray-400',
    '🤝 Contributors': 'text-pink-400'
  };

  return (
    <div className="markdown-content prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Override default element mapping to prevent nested pre elements
        disallowedElements={['pre']}
        unwrapDisallowed={true}
        rehypePlugins={[rehypeRaw, rehypeSanitize, [rehypeHighlight, { ignoreMissing: true }]]}
        components={{
          // Custom component rendering
          h1: ({ node, ...props }) => (
            <h1 className="fl-mb-s fl-text-step-1 font-bold text-primary" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="fl-mb-xs fl-text-step-0 font-bold text-primary mt-6" {...props} />
          ),
          h3: ({ node, ...props }) => {
            // Check if this is an emoji category heading (e.g., "🐛 Bug Fixes")
            const textContent = props.children?.toString() || '';
            const categoryColor = Object.entries(categoryColors).find(
              ([category]) => textContent.includes(category)
            )?.[1];
            
            return (
              <h3 
                className={cn(
                  "fl-mb-xs fl-text-step--1 font-bold mt-6 mb-3",
                  categoryColor || "text-primary",
                  textContent === 'Important' && "text-orange-500"
                )} 
                {...props} 
              />
            );
          },
          h4: ({ node, ...props }) => (
            <h4 className="fl-mb-xs fl-text-step--1 font-semibold text-primary" {...props} />
          ),
          a: ({ node, ...props }) => {
            // Handle GitHub links specially
            const href = props.href || '';
            const isGitHubIssue = href.includes('github.com/payloadcms/payload/issues/');
            const isGitHubCommit = href.includes('github.com/payloadcms/payload/commit/');
            const isPR = isGitHubIssue && href.includes('/pull/') || /\(#\d+\)/.test(props.children?.toString() || '');
            
            let className = "text-blue-400 hover:text-blue-300 hover:underline transition-colors";
            let displayText = props.children;
            
            // For commit hashes, only show first 7 characters
            if (isGitHubCommit && typeof displayText === 'string' && /^[a-f0-9]{7,40}$/.test(displayText)) {
              displayText = displayText.substring(0, 7);
              className = "font-mono text-gray-400 bg-black/30 px-1 py-0.5 rounded text-xs";
            }
            
            // For PR links, make them stand out
            if (isPR) {
              className = "text-purple-400 hover:text-purple-300 hover:underline transition-colors font-medium";
            }
            
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={className} 
                {...props}
              >
                {displayText}
              </a>
            );
          },
          code: ({ node, inline, className, children, ...props }: CodeProps) => {
            // Handle inline code vs code blocks
            if (inline) {
              return (
                <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-sm" {...props}>
                  {children}
                </code>
              );
            }
            
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            
            // Special handling for diff code
            if (lang === 'diff') {
              const lines = String(children).split('\n');
              return (
                <div className="my-4 overflow-hidden rounded-md shadow-md">
                  <div className="bg-gray-900 px-4 py-2 text-xs font-medium text-gray-300 flex justify-between">
                    <span>Diff</span>
                    <span className="text-xs text-gray-500">git diff</span>
                  </div>
                  <div className="overflow-x-auto bg-[#0d1117]">
                    <pre className="p-4 leading-relaxed">
                      <code className={className} {...props}>
                        {lines.map((line, i) => {
                          if (line.startsWith('+')) {
                            return <div key={i} className="text-green-500">{line}</div>;
                          } else if (line.startsWith('-')) {
                            return <div key={i} className="text-red-500">{line}</div>;
                          }
                          return <div key={i} className="text-gray-400">{line}</div>;
                        })}
                      </code>
                    </pre>
                  </div>
                </div>
              );
            }
            
            // Regular code blocks
            return (
              <div className="my-4 overflow-hidden rounded-md shadow-md">
                <div className="bg-gray-900 px-4 py-2 text-xs font-medium text-gray-300 flex justify-between">
                  <span>{lang.toUpperCase() || 'CODE'}</span>
                </div>
                <div className="overflow-x-auto bg-[#0d1117]">
                  <pre className="p-4 leading-relaxed">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              </div>
            );
          },
          strong: ({ node, ...props }) => {
            const text = props.children?.toString() || '';
            // Check for "storage-s3:" pattern or **package:** pattern
            const isSection = /^[a-z0-9-]+:$/.test(text);
            const isPackage = /^[a-z0-9-@/]+:$/.test(text);
            
            return (
              <strong 
                className={cn(
                  isSection && "text-yellow-400",
                  isPackage && "text-blue-400 font-mono"
                )} 
                {...props} 
              />
            );
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc my-4 ml-6 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal my-4 ml-6 pl-4 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => {
            const text = props.children?.toString() || '';
            // Check if this is a contributor line (e.g. "- Name (@username)")
            const isContributor = /^[^(]+ \(@[a-zA-Z0-9_-]+\)$/.test(text);
            
            return (
              <li className={cn(
                "mb-1",
                isContributor && "text-pink-400"
              )} {...props} />
            );
          },
          p: ({ node, ...props }) => (
            <p className="mb-4" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t border-white/20" {...props} />
          ),
        }}
      >
        {cleanedContent || ''}
      </ReactMarkdown>
      
      {/* Process code blocks separately to avoid hydration issues */}
      {cleanedContent?.includes('```') && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize, [rehypeHighlight, { ignoreMissing: true }]]}
          // Only process code blocks
          allowedElements={['pre', 'code']}
          components={{
            code: ({ node, inline, className, children, ...props }: CodeProps) => {
              if (inline) return null; // Skip inline code
              
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : '';
              
              // Special handling for diff code
              if (lang === 'diff') {
                const lines = String(children).split('\n');
                return (
                  <div className="my-4 overflow-hidden rounded-md shadow-md">
                    <div className="bg-gray-900 px-4 py-2 text-xs font-medium text-gray-300 flex justify-between">
                      <span>Diff</span>
                      <span className="text-xs text-gray-500">git diff</span>
                    </div>
                    <div className="overflow-x-auto bg-[#0d1117]">
                      <pre className="p-4 leading-relaxed">
                        <code className={className} {...props}>
                          {lines.map((line, i) => {
                            if (line.startsWith('+')) {
                              return <div key={i} className="text-green-500">{line}</div>;
                            } else if (line.startsWith('-')) {
                              return <div key={i} className="text-red-500">{line}</div>;
                            }
                            return <div key={i} className="text-gray-400">{line}</div>;
                          })}
                        </code>
                      </pre>
                    </div>
                  </div>
                );
              }
              
              // Regular code blocks
              return (
                <div className="my-4 overflow-hidden rounded-md shadow-md">
                  <div className="bg-gray-900 px-4 py-2 text-xs font-medium text-gray-300 flex justify-between">
                    <span>{lang.toUpperCase() || 'CODE'}</span>
                  </div>
                  <div className="overflow-x-auto bg-[#0d1117]">
                    <pre className="p-4 leading-relaxed">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                </div>
              );
            },
            pre: ({ node, ...props }) => <>{props.children}</>,
          }}
        >
          {cleanedContent || ''}
        </ReactMarkdown>
      )}
    </div>
  );
}

export default MarkdownRenderer
