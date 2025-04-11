'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@heroui/react';

interface RichTextEditorProps {
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
  placeholder?: string;
}

// This is a placeholder component that will be replaced with a proper rich text editor
// For now, it's just a textarea that stores content as a simple array structure
export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Write your content here...',
}: RichTextEditorProps) {
  const [text, setText] = useState('');

  // Initialize text from value prop if provided
  useEffect(() => {
    if (value && Array.isArray(value)) {
      try {
        // Try to extract text content from the rich text structure
        const plainText = value
          .map(node => {
            if (typeof node === 'string') return node;
            if (node.children)
              return node.children
                .map(child => (typeof child === 'string' ? child : child.text || ''))
                .join('');
            return '';
          })
          .join('\n\n');

        setText(plainText);
      } catch (e) {
        console.error('Error parsing rich text value:', e);
        setText('');
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Convert to a basic rich text structure (paragraphs)
    // This is greatly simplified - a real editor would create proper nodes
    if (onChange) {
      const paragraphs = newText.split('\n\n').filter(Boolean);
      const richText = paragraphs.map(paragraph => ({
        type: 'paragraph',
        children: [{ text: paragraph }],
      }));

      onChange(richText);
    }
  };

  return (
    <div className="rich-text-editor border-border rounded-md border">
      <Textarea
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        className="min-h-[200px] w-full p-3"
        isDisabled={disabled}
      />
      <div className="border-border border-t bg-background/50 p-2 text-xs text-foreground/60">
        <p>Simple text editor (supports paragraphs with double line breaks)</p>
        <p className="mt-1">This is a placeholder for a full-featured rich text editor.</p>
      </div>
    </div>
  );
}
