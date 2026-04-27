// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true' && repo;

export default defineConfig({
  site: 'https://victornoe24.github.io',
  base: isGitHubPagesBuild ? `/${repo}` : '/',
  integrations: [react()],
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
