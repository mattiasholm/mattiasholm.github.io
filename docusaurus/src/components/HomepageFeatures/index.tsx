import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type FeatureItem = {
  icon: JSX.Element;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    icon: (
      <Link to='/drinks'>
        <img src='/img/drinks.png' className={styles.featureIcon} />
      </Link>
    ),
    description: <>A collection of drinks & cocktails</>,
  },
  {
    icon: (
      <Link to='/tunes'>
        <img src='/img/tunes.png' className={styles.featureIcon} />
      </Link>
    ),
    description: <>A collection of traditional Irish tunes</>,
  },
  {
    icon: (
      <Link to='/dives'>
        <img src='/img/dives.png' className={styles.featureIcon} />
      </Link>
    ),
    description: <>A collection of scuba dives</>,
  },
];

function Feature({ icon, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center padding-horiz--md'>
        <p className={styles.featureIconWrap}>{icon}</p>
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
