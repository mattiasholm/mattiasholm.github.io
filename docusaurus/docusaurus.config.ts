import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const emojis = '🍸🎻 💻';

const config: Config = {
  title: 'Mattias Holm',
  tagline: 'A small website for my hobbies',
  favicon: 'img/favicon.ico',

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
      title: emojis,
      items: [
        {
          label: 'Drinks',
          to: '/drinks/',
          // type: 'docSidebar',
          // sidebarId: 'defaultSidebar',
          // sidebarId: 'drinks',
        },
        {
          label: 'Tunes',
          to: '/tunes/',
          // type: 'docSidebar',
          // sidebarId: 'tunes',
        },
        // {
        //   label: 'Code',
        //   to: '/code/',
        // },
        // {
        //   label: 'Lyrics',
        //   to: '/lyrics/',
        // },
        {
          label: 'GitHub',
          href: 'https://github.com/mattiasholm',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Mattias Holm`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  customFields: {
    emojis: emojis,
  },
};

export default config;
