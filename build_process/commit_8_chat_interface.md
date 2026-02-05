# Commit 8: Chat Interface

## Summary
Enhance the chat interface with markdown rendering, typing indicators, welcome screen, and improved user experience for conversations with the AI assistant.

## Changes

### React Renderer

#### `src/pages/Chat/index.tsx`
Complete rewrite with enhanced features:

**New Components:**
- `ChatMessage` - Individual message with markdown support
- `TypingIndicator` - Animated dots during AI response
- `WelcomeScreen` - Onboarding screen for new users

**Features:**
- Markdown rendering with react-markdown and remark-gfm
- Code syntax highlighting with copy button
- Auto-resizing textarea input
- Gateway connection status awareness
- Tool call status badges
- Copy message content button
- Shift+Enter for new lines

**UI Improvements:**
- Gradient avatar for AI assistant
- Rounded message bubbles
- Hover actions (copy, etc.)
- Responsive prose styling
- Custom code block display

#### `src/components/ui/textarea.tsx` (New)
Textarea component based on shadcn/ui:
- Auto-resize support
- Focus ring styling
- Disabled state

#### `src/styles/globals.css`
Added prose styling:
- Markdown list formatting
- Blockquote styling
- Table formatting
- Code block margins
- Typing indicator animation

### Dependencies

#### `package.json`
New dependencies:
- `react-markdown@10.1.0` - Markdown rendering
- `remark-gfm@4.0.1` - GitHub Flavored Markdown support

## Technical Details

### Message Rendering Flow

```
Message Content
      |
      v
  Is User?
      |
  ┌───┴───┐
  Yes     No
  |       |
  v       v
Plain   ReactMarkdown
Text       |
           v
      remark-gfm
           |
           v
      Custom Components
      (code, links, etc.)
```

### Markdown Components

| Element | Custom Handling |
|---------|----------------|
| `code` | Inline vs block detection, syntax highlighting label, copy button |
| `a` | External link (new tab), primary color styling |
| `pre` | Background styling, overflow scroll |
| Lists | Proper indentation and spacing |
| Tables | Border collapse, header background |
| Blockquotes | Left border, muted color |

### Typing Indicator Animation

```css
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

/* Staggered delay for dots */
.dot-1 { animation-delay: 0ms; }
.dot-2 { animation-delay: 150ms; }
.dot-3 { animation-delay: 300ms; }
```

### Input Handling

**Key Combinations:**
- `Enter` - Send message
- `Shift+Enter` - New line
- Auto-resize up to 200px max height

**State Management:**
- Textarea value tracked in local state
- Height recalculated on content change
- Focus maintained after send

### Gateway Integration

**Connection Awareness:**
- Warning banner when Gateway offline
- Input disabled without connection
- Fetch history only when connected
- Error display for failed messages

### Welcome Screen Features

Quick start cards showing:
- "Ask Questions" - General Q&A capability
- "Creative Tasks" - Writing and brainstorming

Gradient branding with ClawX logo.

## UI/UX Considerations

1. **Message Alignment**: User messages right-aligned, AI left-aligned
2. **Avatar Design**: Gradient for AI, solid for user
3. **Hover Actions**: Progressive disclosure of copy buttons
4. **Feedback**: Toast on code copy, visual state for copied
5. **Loading States**: Typing indicator during AI response
6. **Error Handling**: Inline error display with icon

## Version
v0.1.0-alpha (incremental)
