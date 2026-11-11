import React from 'react';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useDocsData } from '@docusaurus/plugin-content-docs/client';
import styles from '../filter.module.css';

export interface Tune {
  id: string;
  title: string;
  tuneType: string;
  keySignature: string;
  mode: string;
  tonic: string;
}

export default function FilterTunes() {
  const { tunes } = usePluginData('tunes-stats') as { tunes: Tune[] };
  const { versions } = useDocsData('default');
  const paths = new Map(versions.flatMap((version) =>
    version.docs.map((doc) => [doc.id, doc.path] as const),
  ));
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tuneType = searchParams.get('type') ?? '';
  const tonic = searchParams.get('tonic') ?? '';
  const mode = searchParams.get('mode') ?? '';
  const updateFilters = (filters: Partial<Record<'type' | 'key' | 'tonic' | 'mode', string>>) => {
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
  const tuneTypes = [...new Set(tunes.map((tune) => tune.tuneType))].sort();
  const tonics = [...new Set(tunes.map((tune) => tune.tonic))].sort();
  const modes = [...new Set(tunes.map((tune) => tune.mode))].sort();
  const filtered = tunes.filter((tune) =>
    (!tuneType || tune.tuneType === tuneType)
    && (!tonic || tune.tonic === tonic)
    && (!mode || tune.mode === mode),
  );

  return (
    <div>
      <div className={styles.filters}>
        <label>
          Tune type
          <select value={tuneType} onChange={(event) => updateFilters({ type: event.target.value })}>
            <option value=''>All tune types</option>
            {tuneTypes.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Tonic
          <select value={tonic} onChange={(event) => updateFilters({ tonic: event.target.value, key: '' })}>
            <option value=''>All tonics</option>
            {tonics.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Mode
          <select value={mode} onChange={(event) => updateFilters({ mode: event.target.value })}>
            <option value=''>All modes</option>
            {modes.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <button
          type='button'
          className='button button--secondary'
          disabled={!tuneType && !tonic && !mode}
          onClick={() => updateFilters({ type: '', key: '', tonic: '', mode: '' })}
        >
          Clear filters
        </button>
      </div>
      <p role='status'>{filtered.length} of {tunes.length} tunes</p>
      <ul className={styles.results}>
        {filtered.map((tune) => {
          const permalink = paths.get(tune.id);
          if (!permalink) {
            throw new Error(`Missing tune URL for ${tune.id}`);
          }
          return (
            <li className={styles.card} key={tune.id}>
              <Link to={permalink}>{tune.title}</Link>
              <div>{tune.tuneType} · {tune.keySignature}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
