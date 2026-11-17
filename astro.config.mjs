// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/*
 * Production origin, used for canonical URLs, Open Graph URLs, the sitemap and RSS.
 * SITE_URL can override it, for example on an Amplify preview branch.
 */
const site = process.env.SITE_URL || 'https://hybridraceco.com';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
});
