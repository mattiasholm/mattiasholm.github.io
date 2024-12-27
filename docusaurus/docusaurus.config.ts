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
          id: 'drinks',
          path: 'docs/drinks',
          routeBasePath: '/',
          sidebarCollapsible: false,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // plugins: [
  //   [
  //     '@docusaurus/plugin-content-docs',
  //     {
  //       id: 'drinks',
  //       path: 'docs/drinks',
  //       routeBasePath: '/',
  //       sidebarCollapsible: false,
  //     },
  //   ],
  // ],

  themeConfig: {
    docs: {
      sidebar: {
        hideable: true,
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
        },
        // {
        //   label: 'Tunes',
        //   to: '/tunes/',
        // },
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
