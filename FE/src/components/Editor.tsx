import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, height = 400 }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Underline,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', minHeight: height }}>
      <div style={{ marginBottom: '10px' }}>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor?.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor?.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline?.().run()}
          className={editor?.isActive('underline') ? 'is-active' : ''}
        >
          Underline
        </button>
      </div>
      <EditorContent editor={editor} />
      <style>{`
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
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          line-height: 1.5;
          margin: 16px 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          line-height: 1.5;
          margin: 14px 0;
        }
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          line-height: 1.5;
          margin: 12px 0;
        }
        .ProseMirror p {
          margin: 8px 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default Editor; 