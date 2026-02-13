# TipTap Rich Text Editor Implementation

This document describes the TipTap editor implementation used in the blog system, including all extensions, configurations, and features for real-time content editing.

## Installation

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header
```

## Core Dependencies

```json
{
  "@tiptap/react": "^3.14.0",
  "@tiptap/starter-kit": "^3.14.0",
  "@tiptap/extension-link": "^3.14.0",
  "@tiptap/extension-image": "^3.14.0",
  "@tiptap/extension-placeholder": "^3.14.0",
  "@tiptap/extension-text-align": "^3.15.3",
  "@tiptap/extension-underline": "^3.15.3",
  "@tiptap/extension-table": "^3.15.3",
  "@tiptap/extension-table-row": "^3.15.3",
  "@tiptap/extension-table-cell": "^3.15.3",
  "@tiptap/extension-table-header": "^3.15.3"
}
```

## Editor Configuration

### Extensions Setup

```typescript
const editor = useEditor({
  immediatelyRender: false,
  extensions: [
    StarterKit.configure({
      hardBreak: false, // Disable hard breaks to force new paragraphs
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-blue-500 underline",
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: "max-w-full h-auto rounded-lg",
      },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: "border-collapse table-auto w-full my-4",
      },
    }),
    TableRow,
    TableHeader.configure({
      HTMLAttributes: {
        class: "border border-gray-300 bg-gray-100 px-4 py-2 font-bold text-left",
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: "border border-gray-300 px-4 py-2",
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder: "Start writing...",
    }),
  ],
  content,
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    const cleanedHtml = cleanEmptyParagraphs(html);
    onChange(cleanedHtml);
  },
  editorProps: {
    attributes: {
      class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-bold [&_h4]:text-xl [&_h4]:font-bold [&_h5]:text-lg [&_h5]:font-bold [&_h6]:text-base [&_h6]:font-bold",
    },
  },
});
```

## Real-Time Updates

### onChange Handler

The editor updates parent component in real-time through the `onUpdate` callback:

```typescript
onUpdate: ({ editor }) => {
  const html = editor.getHTML();
  const cleanedHtml = cleanEmptyParagraphs(html);
  onChange(cleanedHtml);
}
```

Every keystroke triggers the `onUpdate` event, which:
1. Gets the current HTML content
2. Cleans empty paragraphs and extra spaces
3. Passes cleaned HTML to parent component via `onChange` prop

## Empty Paragraph & Space Cleaning

### cleanEmptyParagraphs Function

This function removes all variations of empty paragraphs and normalizes spacing:

```typescript
const cleanEmptyParagraphs = (html: string): string => {
  let cleaned = html;
  let previous = '';
  
  // Keep cleaning until no more changes occur
  while (cleaned !== previous) {
    previous = cleaned;
    cleaned = cleaned
      .replace(/<p><\/p>/gi, '')                    // Empty <p></p>
      .replace(/<p>\s*<\/p>/gi, '')                 // <p> with whitespace </p>
      .replace(/<p><br><\/p>/gi, '')                // <p><br></p>
      .replace(/<p><br\/><\/p>/gi, '')              // <p><br/></p>
      .replace(/<p><br \/><\/p>/gi, '')             // <p><br /></p>
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')    // Any variation of <p> <br> </p>
      .replace(/<p>&nbsp;<\/p>/gi, '')              // <p>&nbsp;</p>
      .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '');       // <p> &nbsp; </p>
  }
  
  return cleaned.trim();
};
```

**Key Features:**
- Runs in loop until no changes detected (handles nested empties)
- Removes 8 different variations of empty paragraphs
- Case-insensitive matching (`gi` flag)
- Trims final output
- Prevents multiple empty lines in output

## Available Features

### Text Formatting
- **Bold** (`Ctrl+B`) - via StarterKit
- **Italic** (`Ctrl+I`) - via StarterKit
- **Underline** - via Underline extension
- **Strike-through** - via StarterKit
- **Inline Code** - via StarterKit
- **Code Block** - via StarterKit

### Headings
- H1 through H6 - via StarterKit
- Custom styling with Tailwind classes
- Configurable in `editorProps.attributes.class`

### Lists
- **Bullet List** - via StarterKit
- **Ordered List** - via StarterKit
- Proper nesting support

### Block Elements
- **Blockquote** - via StarterKit
- **Horizontal Rule** - via StarterKit
- **Paragraph** - via StarterKit

### Text Alignment
- Left, Center, Right, Justify
- Applies to headings and paragraphs
- Via TextAlign extension

### Links
- Add/edit links with custom URL
- Styled with `text-blue-500 underline`
- Opens in same tab by default (`openOnClick: false`)

```typescript
const handleAddLink = () => {
  const url = window.prompt("Enter URL:");
  if (url) {
    editor.chain().focus().setLink({ href: url }).run();
  }
};
```

### Images
- Insert images via URL
- Responsive sizing (`max-w-full h-auto`)
- Rounded corners (`rounded-lg`)

```typescript
const handleAddImage = () => {
  const url = window.prompt("Enter image URL:");
  if (url) {
    editor.chain().focus().setImage({ src: url }).run();
  }
};
```

### Tables
- Resizable tables
- Dynamic row/column creation
- Header row support
- Custom styling for headers and cells

```typescript
const handleInsertTable = () => {
  const rows = window.prompt("Number of rows:", "3");
  const cols = window.prompt("Number of columns:", "3");
  
  if (rows && cols) {
    const numRows = parseInt(rows);
    const numCols = parseInt(cols);
    
    if (numRows > 0 && numCols > 0) {
      editor.chain().focus().insertTable({ 
        rows: numRows, 
        cols: numCols, 
        withHeaderRow: true 
      }).run();
    }
  }
};
```

### History
- **Undo** (`Ctrl+Z`) - via StarterKit
- **Redo** (`Ctrl+Shift+Z`) - via StarterKit
- Buttons disabled when unavailable

### Source Code View
- Toggle between WYSIWYG and HTML source
- Edit HTML directly
- Auto-cleans on switch back to editor

```typescript
const toggleSourceView = () => {
  if (!showSource) {
    setSourceCode(editor.getHTML());
  } else {
    const cleanedSource = cleanEmptyParagraphs(sourceCode);
    editor.commands.setContent(cleanedSource);
    onChange(cleanedSource);
  }
  setShowSource(!showSource);
};
```

## Styling

### Editor Styles (globals.css)

```css
/* TipTap Editor Styles */
.ProseMirror {
  outline: none;
}

/* Placeholder */
.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Lists */
.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.ProseMirror ul { list-style-type: disc; }
.ProseMirror ol { list-style-type: decimal; }
.ProseMirror li { margin: 0.25rem 0; }

/* Blockquote */
.ProseMirror blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #6b7280;
  font-style: italic;
}

/* Code */
.ProseMirror code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
}

/* Code Block */
.ProseMirror pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.ProseMirror pre code {
  background: none;
  color: inherit;
  padding: 0;
}

/* Images */
.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

/* Headings */
.ProseMirror h1 {
  font-size: 2.25rem;
  font-weight: bold;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.ProseMirror h2 {
  font-size: 1.875rem;
  font-weight: bold;
  margin-top: 1.75rem;
  margin-bottom: 0.875rem;
}

.ProseMirror h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}
```

## Component Props

```typescript
interface RichTextEditorProps {
  content: string;           // Initial HTML content
  onChange: (content: string) => void;  // Real-time update callback
  placeholder?: string;       // Optional placeholder text
}
```

## Usage Example

```tsx
import RichTextEditor from "@/app/components/RichTextEditor";

function BlogEditor() {
  const [content, setContent] = useState("");
  
  return (
    <RichTextEditor 
      content={content}
      onChange={setContent}
      placeholder="Write your blog post..."
    />
  );
}
```

## Key Design Decisions

1. **`immediatelyRender: false`** - Prevents SSR hydration issues
2. **`hardBreak: false`** - Forces proper paragraph structure instead of `<br>` tags
3. **Real-time cleaning** - Cleans HTML on every update to prevent bloat
4. **Looping cleaner** - Ensures all nested empty elements removed
5. **Prose classes** - Uses Tailwind Typography for consistent styling
6. **Custom heading sizes** - Overrides prose defaults with specific pixel sizes
7. **Resizable tables** - Better UX for table editing
8. **URL prompts** - Simple UX for links/images (can be replaced with modals)

## Browser Compatibility

Works in all modern browsers supporting:
- ES6+
- CSS Grid/Flexbox
- contentEditable API

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Debounce onChange if saving to backend frequently
- Consider lazy loading for large documents
- Clean HTML is lightweight (no excessive empty tags)
- EditorContent component efficiently handles DOM updates

## Future Enhancements

Potential improvements:
- [ ] Add syntax highlighting for code blocks
- [ ] Implement modal dialogs for links/images instead of prompts
- [ ] Add emoji picker
- [ ] Support for embedded videos
- [ ] Collaborative editing with WebSockets
- [ ] Auto-save functionality
- [ ] Word count display
- [ ] Character limit enforcement
- [ ] Export to Markdown/PDF
