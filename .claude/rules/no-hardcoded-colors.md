## No Hardcoded Colors — Use Tailwind Theme Tokens

**NEVER use hardcoded hex colors** like `text-[#48484A]` or `bg-[#1C1C1E]` in components.

### Why

- Hardcoded colors break theme consistency
- They can't be changed from one place
- They make dark/light mode impossible to manage
- Tailwind's JIT arbitrary values bypass the design system

### What to Use Instead

1. **Tailwind semantic classes** (preferred):

   ```tsx
   // ❌ BAD
   <p className="text-[#8E8E93]">Muted text</p>

   // ✅ GOOD
   <p className="text-muted-foreground">Muted text</p>
   ```

2. **CSS custom properties** via Tailwind config for colors not in the default theme:

   ```css
   /* globals.css */
   :root {
     --color-accent-purple: #8b5cf6;
     --color-success: #34d399;
   }
   ```

   ```tsx
   <span className="text-accent-purple">Purple text</span>
   ```

3. **Status colors** — if you need red/green/yellow for status indicators, use the semantic Tailwind classes:
   - `text-destructive` for errors/danger
   - `text-green-500` for success (standard Tailwind palette)
   - `text-yellow-500` for warnings

### Exception

The ONLY acceptable use of arbitrary hex values is in:

- `tailwind.config.ts` theme definition
- `globals.css` CSS custom properties
- SVG fills/strokes that can't use Tailwind classes
