import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./index.module.css";
import HomepageFeatures from "@site/src/components/HomepageFeatures";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <img src="img/city.svg"></img>
        <div
          className={styles.buttons}
          style={{
            marginTop: "20px",
          }}
        >
          <Link
            className={clsx(
              "button button--secondary button--lg",
              styles.getStartedButton
            )}
            to="/docs/"
            style={{
              color: "#000",
              backgroundColor: "#fff",
              border: "2px solid var(--ifm-color-primary-dark)",
            }}
          >
            Get started here!
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Digital Twin City Viewer - an open source toolkit for collaborative right-time city data online"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
