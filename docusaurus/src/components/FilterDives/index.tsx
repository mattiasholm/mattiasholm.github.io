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
  const updateFilters = (filters: Partial<Record<'site' | 'year' | 'gas', string>>) => {
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
  const sites = [...new Set(dives.map((dive) => dive.site))].sort();
  const years = [...new Set(dives.map((dive) => dive.date.slice(0, 4)))].sort().reverse();
  const gases = [...new Set(dives
    .map((dive) => dive.gas.startsWith('Nitrox') ? 'Nitrox' : dive.gas)
    .filter((value) => value !== '-'))].sort();
  const filtered = dives.filter((dive) =>
    (!site || dive.site === site)
    && (!year || dive.date.startsWith(`${year}-`))
    && (!gas || (gas === 'Nitrox' ? dive.gas.startsWith('Nitrox') : dive.gas === gas)),
  );

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
        <button
          type='button'
          className='button button--secondary'
          disabled={!site && !year && !gas}
          onClick={() => updateFilters({ site: '', year: '', gas: '' })}
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
