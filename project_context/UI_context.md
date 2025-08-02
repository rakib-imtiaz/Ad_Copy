2) UI Documentation (ChatGPT-inspired, Light Theme)
Goal. A fast, familiar chat workflow with left agents/history, center chat, right media—using your palette.

1. Layout
Grid: Left sidebar 280–320px, center fluid (max-width 800px), right media drawer 320–420px (resizable).

Responsive: Hide right panel < 1200px; hide left panel < 800px (add “New Chat” FAB).

Header: Brand at left, active agent chip, quick actions (settings, toggle right panel).

2. Design Tokens (your palette)
css
Copy
Edit
--bg: #FFFFFF;
--surface: #F7F7F7;      /* panels/toolbars */
--surface-2: #FFFFFF;    /* cards/bubbles */
--border: #EEEEEE;       /* dividers */
--text: #393E46;         /* primary text */
--text-muted: #929AAB;   /* secondary */
--accent: #393E46;       /* primary buttons/active */
--accent-hover: #2C3036; /* hover state */
Font: Inter (400/500/600/700)
3. Components
Sidebar (Agents & History)

Item height 40–44px, radius 8–10px; hover --surface-2; active bg #F1F2F4, border #EEEEEE.

Sections: “Agents” (admin-provided), “Conversations”.

Chat Thread

Message width ≤ 720–800px; spacing scale 8/12/16/24.

AI bubble: --surface-2, 1px --border, subtle shadow.

User bubble: --surface-2 (or #F1F2F4 variant).

Code/template blocks: dark code surface, copy button on hover.

Typing indicator + streaming output.

Composer

Multiline textarea (min 40px → max 160px).

Pills for /upload and /transcribe.

Primary button: height 40px, radius 10px, bg --accent, text #FFF, hover --accent-hover.

Media Library (Right Drawer)

Tabs: Files / Links / Transcripts.

Dropzone: dashed #EEEEEE; on dragenter bg #F4F5F7, border/text --accent.

Row height 44–52px, icons 18px, filename truncation with tooltip.

States & Feedback

Focus ring: 0 0 0 2px #FFF, 0 0 0 4px var(--accent).

Empty states (“No agents yet—ask admin”, “Drop files or use /upload”).

Inline toasts near composer for errors/warnings.

4. Accessibility
Contrast ≥ 4.5:1 for text on panel surfaces.

Full keyboard navigation; visible focus.

Respect prefers-reduced-motion.

5. Measurements (quick reference)
Header 56–64px, icon 18px, avatar 28px, bubble radius 16–20px.

