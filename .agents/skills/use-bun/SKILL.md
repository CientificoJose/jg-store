---
name: use-bun
description: >-
  Always prioritize and use Bun as the default package manager and JavaScript/TypeScript runtime instead of npm, yarn, or pnpm. Trigger when installing dependencies, running scripts, dev servers, or building projects in jg-store.
---

# Use Bun Package Manager & Runtime

Always use `bun` as the primary runtime and package manager for this project because of its superior performance and speed.

## Core Directives

1. **Package Installation:**
   * Instead of `npm install` / `pnpm install` / `yarn install` ➔ Use `bun install`
   * Instead of `npm install <pkg>` / `pnpm add <pkg>` ➔ Use `bun add <pkg>`
   * Instead of `npm install -D <pkg>` / `pnpm add -D <pkg>` ➔ Use `bun add -d <pkg>`
   * Instead of `npm uninstall <pkg>` ➔ Use `bun remove <pkg>`

2. **Running Scripts:**
   * Instead of `npm run dev` / `pnpm dev` ➔ Use `bun dev` or `bun run dev`
   * Instead of `npm run build` / `pnpm build` ➔ Use `bun run build`
   * Instead of `npm run test` ➔ Use `bun test`
   * Instead of `npx <tool>` ➔ Use `bunx <tool>`

3. **Running TS/JS Files:**
   * Directly execute TypeScript/JavaScript files with `bun <file.ts>`.

4. **Lockfiles:**
   * Maintain and prioritize `bun.lock`.
