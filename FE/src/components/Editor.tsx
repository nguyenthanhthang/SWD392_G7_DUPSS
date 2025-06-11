import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, height = 400 }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', minHeight: height }}>
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor?.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor?.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={editor?.isActive('underline') ? 'is-active' : ''}
        >
          Underline
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive('bulletList') ? 'is-active' : ''}
        >
          • List
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive('orderedList') ? 'is-active' : ''}
        >
          1. List
        </button>
      </div>
      <EditorContent editor={editor} />
      <style jsx>{`
        button {
          margin-right: 5px;
          padding: 5px 10px;
          border: 1px solid #ccc;
          background: white;
          cursor: pointer;
        }
        button.is-active {
          background: #e2e8f0;
        }
        .ProseMirror {
          min-height: 200px;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }
        .ProseMirror:focus {
          outline: none;
          border-color: #4299e1;
        }
      `}</style>
    </div>
  );
};

export default Editor; 