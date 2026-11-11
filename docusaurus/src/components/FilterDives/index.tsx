import React from 'react';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useDocsData } from '@docusaurus/plugin-content-docs/client';
import styles from '../filter.module.css';

export interface Dive {
  id: string;
  number: number;
  date: string;
  site: string;
  depth: string;
  duration: string;
  gas: string;
}

interface RangeFilterProps {
  legend: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onCommit: (value: [number, number]) => void;
}

function RangeFilter({ legend, label, min, max, step, value, onChange, onCommit }: RangeFilterProps) {
  const commitMin = (event: React.SyntheticEvent<HTMLInputElement>) =>
    onCommit([Math.min(Number(event.currentTarget.value), value[1]), value[1]]);
  const commitMax = (event: React.SyntheticEvent<HTMLInputElement>) =>
    onCommit([value[0], Math.max(Number(event.currentTarget.value), value[0])]);

  return (
    <fieldset className={styles.rangeFilter}>
      <legend>{legend}</legend>
      <label>
        Min: {value[0]}
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={value[0]}
          disabled={value[1] <= min}
          style={{ backgroundSize: `${max > min ? (value[0] - min) / (max - min) * 100 : 0}% 100%` }}
          aria-label={`Minimum ${label}`}
          onChange={(event) => onChange([Math.min(Number(event.target.value), value[1]), value[1]])}
          onPointerUp={commitMin}
          onKeyUp={commitMin}
        />
      </label>
      <label>
        Max: {value[1]}
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={value[1]}
          disabled={value[0] >= max}
          style={{ backgroundSize: `${max > min ? (value[1] - min) / (max - min) * 100 : 0}% 100%` }}
          aria-label={`Maximum ${label}`}
          onChange={(event) => onChange([value[0], Math.max(Number(event.target.value), value[0])])}
          onPointerUp={commitMax}
          onKeyUp={commitMax}
        />
      </label>
    </fieldset>
  );
}

export default function FilterDives() {
  const { dives } = usePluginData('dives-stats') as { dives: Dive[] };
  const { versions } = useDocsData('default');
  const paths = new Map(versions.flatMap((version) =>
    version.docs.map((doc) => [doc.id, doc.path] as const),
  ));
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const site = searchParams.get('site') ?? '';
  const year = searchParams.get('year') ?? '';
  const gas = searchParams.get('gas') ?? '';
  const depths = dives.map((dive) => Number.parseFloat(dive.depth)).filter(Number.isFinite);
  const times = dives.map((dive) => Number.parseFloat(dive.duration)).filter(Number.isFinite);
  const minDepthLimit = depths.length ? Math.min(...depths) : 0;
  const maxDepthLimit = depths.length ? Math.max(...depths) : 0;
  const minTimeLimit = times.length ? Math.min(...times) : 0;
  const maxTimeLimit = times.length ? Math.max(...times) : 0;
  const [depthRange, setDepthRange] = React.useState<[number, number]>([
    Number(searchParams.get('minDepth') || minDepthLimit),
    Number(searchParams.get('maxDepth') || maxDepthLimit),
  ]);
  const [timeRange, setTimeRange] = React.useState<[number, number]>([
    Number(searchParams.get('minTime') || minTimeLimit),
    Number(searchParams.get('maxTime') || maxTimeLimit),
  ]);
  const updateFilters = (filters: Partial<Record<
    'site' | 'year' | 'gas' | 'minDepth' | 'maxDepth' | 'minTime' | 'maxTime',
    string
  >>) => {
    const params = new URLSearchParams(location.search);
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    history.push({ ...location, search: params.toString() });
  };
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    setDepthRange([
      Number(params.get('minDepth') || minDepthLimit),
      Number(params.get('maxDepth') || maxDepthLimit),
    ]);
    setTimeRange([
      Number(params.get('minTime') || minTimeLimit),
      Number(params.get('maxTime') || maxTimeLimit),
    ]);
  }, [location.search, minDepthLimit, maxDepthLimit, minTimeLimit, maxTimeLimit]);
  const updateRange = (
    minKey: 'minDepth' | 'minTime',
    maxKey: 'maxDepth' | 'maxTime',
    range: [number, number],
    minLimit: number,
    maxLimit: number,
  ) => {
    updateFilters({
      [minKey]: range[0] === minLimit ? '' : String(range[0]),
      [maxKey]: range[1] === maxLimit ? '' : String(range[1]),
    });
  };
  const sites = [...new Set(dives.map((dive) => dive.site))].sort();
  const years = [...new Set(dives.map((dive) => dive.date.slice(0, 4)))].sort().reverse();
  const gases = [...new Set(dives
    .map((dive) => dive.gas.startsWith('Nitrox') ? 'Nitrox' : dive.gas)
    .filter((value) => value !== '-'))].sort();
  const hasDepthFilter = depthRange[0] !== minDepthLimit || depthRange[1] !== maxDepthLimit;
  const hasTimeFilter = timeRange[0] !== minTimeLimit || timeRange[1] !== maxTimeLimit;
  const filtered = dives.filter((dive) => {
    const depth = Number.parseFloat(dive.depth);
    const time = Number.parseFloat(dive.duration);
    return (!site || dive.site === site)
      && (!year || dive.date.startsWith(`${year}-`))
      && (!gas || (gas === 'Nitrox' ? dive.gas.startsWith('Nitrox') : dive.gas === gas))
      && (!hasDepthFilter || (
        Number.isFinite(depth) && depth >= depthRange[0] && depth <= depthRange[1]
      ))
      && (!hasTimeFilter || (
        Number.isFinite(time) && time >= timeRange[0] && time <= timeRange[1]
      ));
  });

  return (
    <div>
      <div className={styles.filters}>
        <label>
          Site
          <select value={site} onChange={(event) => updateFilters({ site: event.target.value })}>
            <option value=''>All sites</option>
            {sites.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Year
          <select value={year} onChange={(event) => updateFilters({ year: event.target.value })}>
            <option value=''>All years</option>
            {years.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Gas
          <select value={gas} onChange={(event) => updateFilters({ gas: event.target.value })}>
            <option value=''>All gases</option>
            {gases.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <div className={styles.rangeFilters}>
          <RangeFilter
            legend='Depth (m)'
            label='depth'
            min={minDepthLimit}
            max={maxDepthLimit}
            step={0.1}
            value={depthRange}
            onChange={setDepthRange}
            onCommit={(range) => updateRange(
              'minDepth', 'maxDepth', range, minDepthLimit, maxDepthLimit,
            )}
          />
          <RangeFilter
            legend='Time (min)'
            label='dive time'
            min={minTimeLimit}
            max={maxTimeLimit}
            step={1}
            value={timeRange}
            onChange={setTimeRange}
            onCommit={(range) => updateRange(
              'minTime', 'maxTime', range, minTimeLimit, maxTimeLimit,
            )}
          />
        </div>
        <button
          type='button'
          className='button button--secondary'
          disabled={
            !site && !year && !gas
            && !hasDepthFilter && !hasTimeFilter
            && searchParams.get('minDepth') === null
            && searchParams.get('maxDepth') === null
            && searchParams.get('minTime') === null
            && searchParams.get('maxTime') === null
          }
          onClick={() => {
            setDepthRange([minDepthLimit, maxDepthLimit]);
            setTimeRange([minTimeLimit, maxTimeLimit]);
            updateFilters({
              site: '',
              year: '',
              gas: '',
              minDepth: '',
              maxDepth: '',
              minTime: '',
              maxTime: '',
            });
          }}
        >
          Clear filters
        </button>
      </div>
      <p role='status'>{filtered.length} of {dives.length} dives</p>
      <ul className={styles.results}>
        {filtered.map((dive) => {
          const permalink = paths.get(dive.id);
          if (!permalink) {
            throw new Error(`Missing dive URL for ${dive.id}`);
          }
          return (
            <li className={styles.card} key={dive.id}>
              <h2><Link to={permalink}>#{dive.number}</Link></h2>
              <div className={styles.truncate}>{dive.date} · {dive.site}</div>
              <div>{dive.depth} m · {dive.duration} min</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
