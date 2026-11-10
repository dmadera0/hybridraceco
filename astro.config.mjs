// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// `site` is required for canonical URLs, sitemap and RSS (build step 5).
// Set it to the production domain once Amplify hosting is configured.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx()],
});
