# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start Vite dev server with hot module replacement
- `npm run build` - Type-check with TypeScript then build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on all files

### Testing
No test framework is currently configured. Consider adding Vitest for unit testing React components.

## Architecture

This is a React + TypeScript + Vite project for email development environment. Key aspects:

### Tech Stack
- **React 19.1.1** with TypeScript 5.8.3
- **Vite 7.1.2** for fast development and optimized builds
- **Tailwind CSS v4** with `@tailwindcss/vite` integration
- **shadcn/ui patterns** configured via `components.json`

### Project Structure
- `src/` - All source code
  - `main.tsx` - Application entry point
  - `App.tsx` - Root React component
  - `lib/utils.ts` - Contains `cn()` utility for className management
- Path alias configured: `@/*` maps to `./src/*`

### Styling System
- Tailwind CSS v4 with custom OKLCH color system
- CSS variables defined in `src/index.css` for theming
- Dark mode support via `.dark` class
- Use `cn()` from `@/lib/utils` for conditional classes

### Component Patterns
- Uses `class-variance-authority` for component variants
- `lucide-react` for icons
- Follow shadcn/ui patterns when creating new components

### Important Notes
- All TypeScript paths use the `@/` alias
- ESLint configured with React hooks and refresh plugins
- No test framework currently installed
- Project uses ES modules (`"type": "module"` in package.json)

## Design System & Aesthetics

This project follows a modern, minimal dark theme inspired by Vercel and Linear:

### Color Palette
- **Background**: Deep black (#090909 / oklch(0.09 0 0))
- **Foreground**: Near white (#f2f2f2 / oklch(0.95 0 0))
- **Card**: Slightly elevated black (#1a1a1a / oklch(0.12 0 0))
- **Muted**: Mid-gray for secondary text (#999999 / oklch(0.6 0 0))
- **Border**: Subtle gray with transparency (#333333 / oklch(0.2 0 0))

### Design Principles
1. **Minimal & Clean**: Focus on content with minimal UI chrome
2. **Subtle Depth**: Use transparency and layered backgrounds (e.g., `bg-card/30`, `border-border/50`)
3. **Small Typography**: Use `text-xs` and `text-sm` for UI elements
4. **Rounded Corners**: Consistent `rounded-md` (6px) for cards and buttons
5. **Smooth Interactions**: Transitions on all interactive elements (`transition-colors`)
6. **Visual Hierarchy**: Different background shades for different sections

### Component Patterns
- **Navigation**: 56px height, backdrop blur, subtle bottom border
- **Buttons**: Small padding, subtle hover states with `hover:bg-foreground/5`
- **Icons**: 16px default size, slightly muted with `text-foreground/80`
- **Panels**: Overflow handling, consistent padding (24px), clear section headers
- **Borders**: Always use transparency modifier (e.g., `border-border/50`)

### Spacing
- Navigation padding: `px-6` (24px)
- Panel padding: `p-6` (24px)
- Component gaps: `gap-1` or `gap-2` for tight spacing
- Section margins: `mb-6` between major sections