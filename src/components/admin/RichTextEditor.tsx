import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import styled from 'styled-components';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Table as TableIcon,
} from 'lucide-react';

const EditorContainer = styled.div`
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.gray[50]};
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
`;

const ToolbarButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.white};
  color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.gray[700]};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.gray[100]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ToolbarDivider = styled.div`
  width: 1px;
  background: ${props => props.theme.colors.gray[300]};
  margin: 0 ${props => props.theme.spacing[1]};
`;

const EditorWrapper = styled.div`
  .ProseMirror {
    padding: ${props => props.theme.spacing[4]};
    min-height: 200px;
    outline: none;
    font-size: ${props => props.theme.fontSizes.base};
    line-height: 1.6;

    h1, h2, h3, h4, h5, h6 {
      margin: ${props => props.theme.spacing[3]} 0;
      font-weight: 600;
    }

    h1 { font-size: ${props => props.theme.fontSizes['3xl']}; }
    h2 { font-size: ${props => props.theme.fontSizes['2xl']}; }
    h3 { font-size: ${props => props.theme.fontSizes.xl}; }

    p {
      margin: ${props => props.theme.spacing[2]} 0;
    }

    ul, ol {
      padding-left: ${props => props.theme.spacing[6]};
      margin: ${props => props.theme.spacing[2]} 0;
    }

    li {
      margin: ${props => props.theme.spacing[1]} 0;
    }

    strong {
      font-weight: 700;
    }

    em {
      font-style: italic;
    }

    u {
      text-decoration: underline;
    }

    code {
      background: ${props => props.theme.colors.gray[100]};
      padding: 2px 6px;
      border-radius: ${props => props.theme.radii.sm};
      font-family: monospace;
      font-size: 0.9em;
    }

    pre {
      background: ${props => props.theme.colors.gray[100]};
      padding: ${props => props.theme.spacing[3]};
      border-radius: ${props => props.theme.radii.md};
      overflow-x: auto;
      
      code {
        background: none;
        padding: 0;
      }
    }

    blockquote {
      border-left: 3px solid ${props => props.theme.colors.primary};
      padding-left: ${props => props.theme.spacing[3]};
      margin: ${props => props.theme.spacing[3]} 0;
      color: ${props => props.theme.colors.gray[600]};
    }

    table {
      border-collapse: collapse;
      width: 100%;
      max-width: 100%;
      margin: ${props => props.theme.spacing[3]} 0;
      overflow: hidden;
      table-layout: fixed; /* Garante distribuição igual das colunas */
      overflow-wrap: break-word;
      word-wrap: break-word;
    }

    th, td {
      border: 2px solid ${props => props.theme.colors.gray[300]};
      padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
      text-align: left;
      min-width: 60px; /* Largura mínima mais adequada */
      max-width: 0; /* Força distribuição igual das colunas */
      vertical-align: top;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
    }

    th {
      background: ${props => props.theme.colors.gray[100]};
      font-weight: 600;
    }

    .selectedCell {
      background: rgba(9, 160, 233, 0.1);
    }
  }
`;

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          HTMLAttributes: {
            class: 'hard-break',
          },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'excel-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <EditorContainer>
      <Toolbar>
        <ToolbarButton
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          $active={editor.isActive('bold')}
          title="Negrito (Ctrl+B)"
        >
          <Bold />
        </ToolbarButton>

        <ToolbarButton
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          $active={editor.isActive('italic')}
          title="Itálico (Ctrl+I)"
        >
          <Italic />
        </ToolbarButton>

        <ToolbarButton
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          $active={editor.isActive('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <UnderlineIcon />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          $active={editor.isActive({ textAlign: 'left' })}
          title="Alinhar à esquerda"
        >
          <AlignLeft />
        </ToolbarButton>

        <ToolbarButton
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          $active={editor.isActive({ textAlign: 'center' })}
          title="Centralizar"
        >
          <AlignCenter />
        </ToolbarButton>

        <ToolbarButton
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          $active={editor.isActive({ textAlign: 'right' })}
          title="Alinhar à direita"
        >
          <AlignRight />
        </ToolbarButton>

        <ToolbarButton
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          $active={editor.isActive({ textAlign: 'justify' })}
          title="Justificar"
        >
          <AlignJustify />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          $active={editor.isActive('bulletList')}
          title="Lista com marcadores"
        >
          <List />
        </ToolbarButton>

        <ToolbarButton
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          $active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListOrdered />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Inserir tabela 3x3 (ou cole do Excel com Ctrl+V)"
        >
          <TableIcon />
        </ToolbarButton>
      </Toolbar>

      <EditorWrapper>
        <EditorContent editor={editor} />
      </EditorWrapper>
    </EditorContainer>
  );
};

export default RichTextEditor;
