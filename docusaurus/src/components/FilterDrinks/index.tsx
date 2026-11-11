import React from 'react';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useDocsData } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

export interface Drink {
  id: string;
  title: string;
  spirit: string;
  ingredients: string[];
  glassware: string;
  rating: number;
}

export default function FilterDrinks() {
  const { drinks } = usePluginData('drinks-stats') as { drinks: Drink[] };
  const { versions } = useDocsData('default');
  const paths = new Map(versions.flatMap((version) =>
    version.docs.map((doc) => [doc.id, doc.path] as const),
  ));
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const ingredient = searchParams.get('ingredient') ?? '';
  const glassware = searchParams.get('glassware') ?? '';
  const rating = searchParams.get('rating') ?? '';
  const updateFilters = (filters: Partial<Record<'ingredient' | 'glassware' | 'rating', string>>) => {
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
  const ingredients = [...new Set(drinks.flatMap((drink) => drink.ingredients))].sort();
  const glasses = [...new Set(drinks.map((drink) => drink.glassware))].sort();
  const filtered = drinks.filter((drink) =>
    (!ingredient || drink.ingredients.includes(ingredient))
    && (!glassware || drink.glassware === glassware)
    && (!rating || drink.rating === Number(rating)),
  );

  return (
    <div>
      <div className={styles.filters}>
        <label>
          Ingredient
          <select value={ingredient} onChange={(event) => updateFilters({ ingredient: event.target.value })}>
            <option value=''>All ingredients</option>
            {ingredients.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Glassware
          <select value={glassware} onChange={(event) => updateFilters({ glassware: event.target.value })}>
            <option value=''>All glassware</option>
            {glasses.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Rating
          <select value={rating} onChange={(event) => updateFilters({ rating: event.target.value })}>
            <option value=''>All ratings</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <button
          type='button'
          className='button button--secondary'
          disabled={!ingredient && !glassware && !rating}
          onClick={() => updateFilters({ ingredient: '', glassware: '', rating: '' })}
        >
          Clear filters
        </button>
      </div>
      <p role='status'>{filtered.length} of {drinks.length} drinks</p>
      <ul className={styles.results}>
        {filtered.map((drink) => {
          const permalink = paths.get(drink.id);
          if (!permalink) {
            throw new Error(`Missing recipe URL for ${drink.id}`);
          }
          return (
            <li className={styles.card} key={drink.id}>
              <Link to={permalink}>{drink.title}</Link>
              <div>{drink.spirit} · {drink.glassware}</div>
              <div>{'★'.repeat(drink.rating) + '☆'.repeat(5 - drink.rating)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
