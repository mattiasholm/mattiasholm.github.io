import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type FeatureItem = {
  emoji: JSX.Element;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    emoji: <Link to='/drinks'>🍸</Link>,
    description: <>A collection of cocktails by a hobby mixologist</>,
  },
  {
    emoji: <Link to='/tunes'>🪕</Link>,
    description: <>A collection of traditional Irish tunes in ABC notation</>,
  },
  {
    emoji: <Link to='/dives'>🤿</Link>,
    description: <>A collection of scuba dives from around the world</>,
  },
];

function Feature({ emoji, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center padding-horiz--md'>
        <p className='emoji'>{emoji}</p>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
