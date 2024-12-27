import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const Svg = () => (
  <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10" fill="var(--ifm-background-color)" />
  </svg>
);

const FeatureList: FeatureItem[] = [
  {
    title: 'Drinks',
    Svg: Svg,
    description: (
      <>
        A collection of cocktails by a hobby mixologist
      </>
    ),
  },
  {
    title: 'Tunes',
    Svg: Svg,
    description: (
      <>
        A collection of traditional Irish tunes in ABC notation
      </>
    ),
  },
  {
    title: 'Lyrics',
    Svg: Svg,
    description: (
      <>
        A collection of lyrics written in various bands and projects
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center'>
        <Svg className={styles.featureSvg} role='img' />
      </div>
      <div className='text--center padding-horiz--md'>
        <Heading as='h3'>{title}</Heading>
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
