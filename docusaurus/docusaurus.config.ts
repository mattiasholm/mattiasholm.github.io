import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import fs from 'node:fs';
import path from 'node:path';

function createDrinksStatsPlugin() {
  return {
    name: 'drinks-stats',
    async loadContent() {
      const drinksDir = path.join(__dirname, 'docs', 'drinks');
      const files = fs
        .readdirSync(drinksDir)
        .filter((file) => /\.md$/i.test(file));

      const countsByRating = new Map<number, number>([
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
      ]);

      const spiritCounts = new Map<string, number>();
      const glassCounts = new Map<string, number>();
      const csvRows: Array<[string, string, string, number]> = [];

      for (const file of files) {
        const filePath = path.join(drinksDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        const ratingMatches = [...content.matchAll(/^\s*-\s*(★{1,5}☆{0,4})\s*$/gm)];
        const lastRating = ratingMatches.at(-1)![1];
        const stars = (lastRating.match(/★/g) ?? []).length;

        if (stars >= 1 && stars <= 5) {
          countsByRating.set(stars, (countsByRating.get(stars) ?? 0) + 1);
        }

        const title = content.match(/^# (.+)$/m)![1].trim();

        const ingredientSection = content.match(/## Ingredients\n([\s\S]*?)(?=##|\Z)/)![1];
        const firstIngredient = ingredientSection.match(/^- (.+)$/m)![1];
        const backtickMatch = firstIngredient.match(/`([^`]+)`/)!;
        const normalized = backtickMatch[1].trim();
        const spirit = normalized.charAt(0).toUpperCase() + normalized.slice(1);
        spiritCounts.set(spirit, (spiritCounts.get(spirit) ?? 0) + 1);

        const glasswareSection = content.match(/## Glassware\n([\s\S]*?)(?=##|\Z)/)![1];
        const glassware = glasswareSection.match(/^- (.+)$/m)![1].trim().replace(/ glass$/i, '');
        glassCounts.set(glassware, (glassCounts.get(glassware) ?? 0) + 1);

        csvRows.push([title, spirit, glassware, stars]);
      }

      const csvPath = path.join(__dirname, 'static', 'drinks.csv');
      const escapeCsv = (value: string | number) => {
        const s = String(value);
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csvLines = [
        'Name,Base spirit,Glassware,Rating',
        ...csvRows.map((row) => row.map((value) => escapeCsv(value)).join(',')),
      ];
      fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8');

      const fileCount = files.length;
      const weightedSum = [...countsByRating.entries()].reduce(
        (sum, [rating, count]) => sum + rating * count,
        0,
      );
      const averageRating = (fileCount > 0 ? Math.round((weightedSum / fileCount) * 10) / 10 : 0).toFixed(1);

      const topSpirit = [...spiritCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .at(0)?.[0] ?? '-';

      const topGlassware = [...glassCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .at(0)?.[0] ?? '-';

      return {
        fileCount,
        averageRating,
        topSpirit,
        topGlassware,
        ratings: ['★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★'].map((stars, index) => {
          const count = countsByRating.get(index + 1) ?? 0;
          return {
            stars,
            count,
            percentage: fileCount > 0 ? Math.round((count / fileCount) * 100) : 0,
          };
        }),
      };
    },
    async contentLoaded({
      content,
      actions,
    }: {
      content: unknown;
      actions: { setGlobalData: (data: unknown) => void };
    }) {
      actions.setGlobalData(content);
    },
  };
}

function createDivesStatsPlugin() {
  return {
    name: 'dives-stats',
    async loadContent() {
      const filePath = path.join(__dirname, 'static', 'dives.csv');
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const header = lines[0].split(',');
      const rows = lines.slice(1).map((line) => line.split(','));

      let totalMinutes = 0;
      let maxDepth = 0;
      let maxTime = 0;
      let minDepthTemperature = Number.POSITIVE_INFINITY;
      let maxSurfaceTemperature = Number.NEGATIVE_INFINITY;

      const diveSites = new Set<string>();

      for (const row of rows) {
        const depthRaw = row[header.indexOf('Deep')].trim();
        const depth = Number.parseFloat(depthRaw);
        if (Number.isFinite(depth)) {
          maxDepth = Math.max(maxDepth, depth);
        }

        const diveLengthRaw = row[header.indexOf('Dive length')].trim();
        const diveLength = Number.parseInt(diveLengthRaw.replace(/[^\d-]/g, ''), 10);
        if (Number.isFinite(diveLength)) {
          totalMinutes += diveLength;
          maxTime = Math.max(maxTime, diveLength);
        }

        const depthTemperatureRaw = row[header.indexOf('Depth temperature')].trim();
        const depthTemperature = Number.parseFloat(depthTemperatureRaw);
        if (Number.isFinite(depthTemperature)) {
          minDepthTemperature = Math.min(minDepthTemperature, depthTemperature);
        }

        const surfaceTemperatureRaw = row[header.indexOf('Surface temperature')].trim();
        const surfaceTemperature = Number.parseFloat(surfaceTemperatureRaw);
        if (Number.isFinite(surfaceTemperature)) {
          maxSurfaceTemperature = Math.max(maxSurfaceTemperature, surfaceTemperature);
        }

        const diveSite = row[header.indexOf('Spot title')].trim();
        diveSites.add(diveSite);
      }

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const averageTime = rows.length > 0 ? Math.round(totalMinutes / rows.length) : 0;

      return {
        rowCount: rows.length,
        totalTime: `${hours} h, ${minutes} min`,
        maxDepth: `${maxDepth} m`,
        maxTime: `${maxTime} min`,
        minTemperature: Number.isFinite(minDepthTemperature) ? `${minDepthTemperature} °C` : '-',
        maxTemperature: Number.isFinite(maxSurfaceTemperature) ? `${maxSurfaceTemperature} °C` : '-',
        diveSites: diveSites.size,
        averageTime: `${averageTime} min`,
      };
    },
    async contentLoaded({
      content,
      actions,
    }: {
      content: unknown;
      actions: { setGlobalData: (data: unknown) => void };
    }) {
      actions.setGlobalData(content);
    },
  };
}

const config: Config = {
  title: 'Mattias Holm',
  tagline: 'A website dedicated to my hobbies',
  favicon: '/img/favicon.ico',

  url: 'https://mattiasholm.github.io',
  baseUrl: '/',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    }
  },

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

  plugins: [createDrinksStatsPlugin, createDivesStatsPlugin],

  themeConfig: {
    algolia: {
      appId: 'QUS0BYF6TL',
      apiKey: '099d6f2e33be7e38a662e10a39e439c0',
      indexName: 'mattiasholmio',
    },
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
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
