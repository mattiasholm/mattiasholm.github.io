import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Mattias Holm',
  tagline: 'A website dedicated to my hobbies',
  favicon: '/img/favicon.ico',

  url: 'https://mattiasholm.github.io',
  baseUrl: '/',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          async sidebarItemsGenerator({ defaultSidebarItemsGenerator, ...args }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);
            return sidebarItems.filter((item) => {
              return !('id' in item && item.id.endsWith('/index'));
            });
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    docs: {
      sidebar: {
        autoCollapseCategories: true,
      },
    },
    colorMode: {
      defaultMode: 'dark',
    },
    navbar: {
      logo: {
        src: '/img/favicon.ico',
      },
      items: [
        {
          label: 'Drinks',
          to: '/drinks',
        },
        {
          label: 'Tunes',
          to: '/tunes',
        },
        {
          label: 'Dives',
          to: '/dives',
        },
        {
          href: 'https://github.com/mattiasholm/mattiasholm.github.io',
          position: 'right',
          className: 'github',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `<a href='https://github.com/mattiasholm' target='_blank'>Copyright © ${new Date().getFullYear()} Mattias Holm</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
