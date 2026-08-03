// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://round-eye-pirates.vercel.app',
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
