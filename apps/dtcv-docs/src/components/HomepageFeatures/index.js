import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import IconExternalLink from "../IconExternalLink";

const FeatureList = [
  {
    title: "Built to simplify visualisation of city data online",
    Svg: require("@site/static/img/online.svg").default,
    description: (
      <>
        The Digital Twin City Viewer is a developer platform built for actors
        that both provides and consume data in cities to easily share this
        online through custom web based viewers. Based on participation in the
        Digital Twin Cities Centre (DTCC) we realised that "one viewer to rule
        them all" will not be maintainable as everything around us changes so
        fast.
      </>
    ),
  },
  {
    title: "Built with customisation in mind",
    Svg: require("@site/static/img/connection.svg").default,
    description: (
      <>
        Web apps are more and more built upon reusable components and going away
        from intricate design patterns. What we see is a strong movement towards
        reusable blocks that can be copied into an app and customised. Open data
        and open customisable apps can democratise access to data and
        information and reduce time to value.
        <div className={styles.buttons} style={{ marginTop: 20 }}>
          <Link
            className="button button--secondary button--md"
            to="/docs/core-concepts/customisation"
          >
            More about customisation
          </Link>
        </div>
      </>
    ),
  },
  {
    title: "Seamless integration with the DTCC Platform",
    Svg: require("@site/static/img/integration.svg").default,
    description: (
      <>
        The DTCC Platform is a digital twin city platform developed in the
        Digital Twin Cities Centre (DTCC) hosted by Chalmers University of
        Technology.
        <div
          className={styles.buttons}
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Link
            className="button button--secondary button--md"
            href="https://dtcc.chalmers.se/"
          >
            More about DTCC
            <span
              style={{
                marginLeft: "0.3rem",
                position: "relative",
                bottom: "2px",
              }}
            >
              <IconExternalLink />
            </span>
          </Link>
        </div>
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div>
        <div
          className="text--center"
          style={{
            backgroundColor: "#ddd",
            padding: "1rem",
            borderRadius: "50%",
            marginBottom: "1rem",
            border: "3px solid var(--ifm-color-primary)",
            width: "180px",
            height: "180px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem auto",
          }}
        >
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <h3>{title}</h3>
          <div>{description}</div>
        </div>
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
