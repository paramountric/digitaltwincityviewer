import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Built to simplify visualisation of city data online',
    Svg: require('@site/static/img/online.svg').default,
    description: (
      <>
        The Digital Twin City Viewer is built for actors that both provides and
        consume data in cities to easily share this online. Since the viewer is
        open source (MIT) the lock-in effect is minimal and the customisation
        possibilites maximal.
      </>
    ),
  },
  {
    title: 'Built with decentralized data ownership in mind',
    Svg: require('@site/static/img/connection.svg').default,
    description: (
      <>
        We need to stop copying data! This viewer uses a unique and simple
        concept of letting actors publish data on their own site. The data will
        automatically be updated in the viewer!
        <div className={styles.buttons} style={{ marginTop: 20 }}>
          <Link
            className="button button--secondary button--md"
            to="/docs/datasharing"
          >
            Read more about data sharing here
          </Link>
        </div>
      </>
    ),
  },
  {
    title: 'Seamless integration with the DTCC Platform',
    Svg: require('@site/static/img/integration.svg').default,
    description: (
      <>
        The DTCC Platform is a digital twin city platform developed in the
        Digital Twin Cities Centre (DTCC) hosted by Chalmers University of
        Technology.
        <div className={styles.buttons} style={{ marginTop: 20 }}>
          <Link
            className="button button--secondary button--md"
            href="https://dtcc.chalmers.se/"
          >
            Read more about data DTCC here
          </Link>
        </div>
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <div>{description}</div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
