import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import fs from 'node:fs';
import path from 'node:path';

const interpolate = (template: string, values: Record<string, string>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match);
};

function createDrinksStatsPlugin() {
  return {
    name: 'drinks-stats',
    async loadContent() {
      const dir = path.join(__dirname, 'docs', 'drinks');
      const files = fs
        .readdirSync(dir)
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
        const filePath = path.join(dir, file);
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

function createDivesGeneratorPlugin() {
  return {
    name: 'dives-generator',
    async loadContent() {
      const csvPath = path.join(__dirname, 'static', 'dives.csv');
      const content = fs.readFileSync(csvPath, 'utf8');
      const lines = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const dir = path.join(__dirname, 'docs', 'dives');
      const files = fs.readdirSync(dir);

      for (const file of files) {
        if (/^\d+\.md$/.test(file)) {
          fs.unlinkSync(path.join(dir, file));
        }
      }

      const splitRow = (line: string): string[] => {
        const values: string[] = [];
        let current = '';
        let bracketDepth = 0;

        for (let i = 0; i < line.length; i += 1) {
          const ch = line[i];
          const next = line[i + 1] ?? '';

          if (ch === '[' && next === '[') {
            bracketDepth += 1;
            current += ch;
            continue;
          }

          if (ch === ']' && next === ']' && bracketDepth > 0) {
            bracketDepth -= 1;
            current += ch;
            continue;
          }

          if (ch === ',' && bracketDepth === 0) {
            values.push(current.trim());
            current = '';
            continue;
          }

          current += ch;
        }

        values.push(current.trim());
        return values;
      };

      const header = splitRow(lines[0]);
      const rows = lines.slice(1);

      const stripNumber = (value: string): string => {
        const match = value.match(/-?\d+(?:\.\d+)?/);
        return match?.[0] ?? '';
      };

      const formatDate = (value: string): string => {
        const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
        return `20${match![3]}-${match![2]}-${match![1]}`;
      };

      const templatePath = path.join(dir, '_template.md');
      const template = fs.readFileSync(templatePath, 'utf8');

      rows.forEach((row, idx) => {
        const diveNumber = rows.length - idx;

        const cols = splitRow(row);
        const getColumn = (col: string) => cols[header.indexOf(col)] || '';

        const date = formatDate(getColumn('Date'));
        const diveSite = getColumn('Spot title');
        const lat = getColumn('Spot latitude');
        const lon = getColumn('Spot longitude');
        const depth = stripNumber(getColumn('Deep'));
        const diveTime = getColumn('Dive length');
        const minTemperature = stripNumber(getColumn('Depth temperature'));
        const maxTemperature = stripNumber(getColumn('Surface temperature'));
        const suit = getColumn('Suit');
        const weight = stripNumber(getColumn('Ballast'));
        const visibility = stripNumber(getColumn('Visibility'));

        const tankRaw = getColumn('Ballons[[Material,Volume,Gas,Pressure(start-finish)]]');
        let tankMaterial = '-';
        let tankVolume = '-';
        let gas = '-';

        if (tankRaw.startsWith('[[')) {
          const tankMatch = tankRaw.match(/\[\[(.*?)\]\]/)!;
          const [materialRaw = '', volumeRaw = '', gasRaw = ''] = tankMatch[1]
            .split(',')
            .map((part) => part.trim());
          tankMaterial = materialRaw || '-';
          tankVolume = stripNumber(volumeRaw) || '-';

          if (gasRaw) {
            const nitroxMatch = gasRaw.match(/^Nitrox\s*\((\d+)%?\)$/);

            if (nitroxMatch) {
              gas = `Nitrox (${nitroxMatch[1]}%)`;
            } else {
              gas = gasRaw.charAt(0).toUpperCase() + gasRaw.slice(1).toLowerCase();
            }
          }
        }

        const markdown = interpolate(template, {
          DIVE_NUMBER: String(diveNumber),
          LATITUDE: lat,
          LONGITUDE: lon,
          DATE: date,
          DIVE_SITE: diveSite,
          DEPTH: depth,
          DIVE_TIME: diveTime,
          TANK_MATERIAL: tankMaterial,
          TANK_VOLUME: tankVolume,
          GAS: gas,
          LOWEST_TEMPERATURE: minTemperature,
          HIGHEST_TEMPERATURE: maxTemperature,
          SUIT: suit,
          WEIGHT: weight,
          VISIBILITY: visibility,
        });

        const filePath = path.join(dir, `${diveNumber}.md`);
        fs.writeFileSync(filePath, markdown, 'utf8');
      });
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

      const diveSiteCounts = new Map<string, number>();
      const diveSiteCoordinates = new Map<string, { lat: string; lon: string }>();

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
        diveSiteCounts.set(diveSite, (diveSiteCounts.get(diveSite) ?? 0) + 1);

        const lat = row[header.indexOf('Spot latitude')]?.trim() ?? '0';
        const lon = row[header.indexOf('Spot longitude')]?.trim() ?? '0';
        diveSiteCoordinates.set(diveSite, { lat, lon });
      }

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const averageTime = rows.length > 0 ? Math.round(totalMinutes / rows.length) : 0;
      const topDiveSites = diveSiteCounts.size === 0
        ? Array.from({ length: 5 }, () => ({
          name: '-',
          count: 0,
          lat: '0',
          lon: '0',
        }))
        : [...diveSiteCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({
            name,
            count,
            lat: diveSiteCoordinates.get(name)?.lat,
            lon: diveSiteCoordinates.get(name)?.lon,
          }));

      return {
        rowCount: rows.length,
        diveSites: diveSiteCounts.size,
        totalTime: `${hours} h, ${minutes} min`,
        averageTime: `${averageTime} min`,
        maxTime: `${maxTime} min`,
        maxDepth: `${maxDepth} m`,
        minTemperature: Number.isFinite(minDepthTemperature) ? `${minDepthTemperature} °C` : '-',
        maxTemperature: Number.isFinite(maxSurfaceTemperature) ? `${maxSurfaceTemperature} °C` : '-',
        topDiveSites,
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

  plugins: [createDrinksStatsPlugin, createDivesGeneratorPlugin, createDivesStatsPlugin],

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
