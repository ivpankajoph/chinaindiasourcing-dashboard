"use client";

import * as React from "react";

type Props = {
  html: string;
  onChange: (html: string) => void;
  className?: string;
};

export function VisualHtmlEditor({ html, onChange, className }: Props) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const lastEditorHtml = React.useRef<string | null>(null);

  React.useLayoutEffect(() => {
    const editor = editorRef.current;
    if (editor && html !== lastEditorHtml.current) {
      editor.innerHTML = html;
      lastEditorHtml.current = html;
    }
  }, [html]);

  return (
    <div
      ref={editorRef}
      contentEditable
      role="textbox"
      aria-label="Email content"
      aria-multiline="true"
      suppressContentEditableWarning
      onInput={(event) => {
        const nextHtml = event.currentTarget.innerHTML;
        lastEditorHtml.current = nextHtml;
        onChange(nextHtml);
      }}
      className={className}
    />
  );
}
