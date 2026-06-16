import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import styles from './QuillEditor.module.css';

type QuillEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
};

const normalizeHtml = (html: string) => {
  const trimmed = html?.trim() ?? '';
  return trimmed === '<p><br></p>' ? '' : trimmed;
};

const DEFAULT_MIN_LINES = 6;
const DEFAULT_LINE_HEIGHT_PX = 24;

export default function QuillEditor({
  value,
  onChange,
  placeholder = 'Type here...',
  minHeight = DEFAULT_MIN_LINES * DEFAULT_LINE_HEIGHT_PX,
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const isProgrammaticUpdate = useRef(false);

  // Init only once
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    // Important for StrictMode/dev remount behavior
    editorRef.current.innerHTML = '';

    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'clean'],
        ],
      },
    });

    quillRef.current = quill;

    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    const handleTextChange = () => {
      if (isProgrammaticUpdate.current) return;
      onChange(normalizeHtml(quill.root.innerHTML));
    };

    quill.on('text-change', handleTextChange);

    return () => {
      quill.off('text-change', handleTextChange);
      quillRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value -> editor (without re-creating editor)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const current = normalizeHtml(quill.root.innerHTML);
    const next = normalizeHtml(value);

    if (current !== next) {
      isProgrammaticUpdate.current = true;
      quill.clipboard.dangerouslyPasteHTML(next || '');
      isProgrammaticUpdate.current = false;
    }
  }, [value]);

  return (
    <div className={styles.wrapper} style={{ ['--editor-min-height' as string]: `${minHeight}px` }}>
      <div ref={editorRef} className={styles.editor} />
    </div>
  );
}