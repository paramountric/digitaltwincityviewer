import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Digital Twin City Viewer",
  tagline:
    "An open source toolkit for collaborative right-time city data online",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://digitaltwincityviewer.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "paramountric", // Usually your GitHub org/user name.
  projectName: "digitaltwincityviewer", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/paramountric/digitaltwincityviewer/tree/main/website/docs/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Digital Twin City Viewer",
      logo: {
        alt: "DTCV Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/paramountric/digitaltwincityviewer",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Get started",
              to: "/docs/reference/getting-started",
            },
            {
              label: "Documentation",
              to: "/docs/",
            },
            {
              label: "Core concepts",
              to: "/docs/core-concepts/customisation",
            },
          ],
        },
        {
          title: "Links",
          items: [
            {
              label: "Digital Twin Cities Centre",
              href: "https://dtcc.chalmers.se/",
            },
            {
              label: "Paramountric",
              href: "https://paramountric.com",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Paramountric. Built with support from Chalmers University of Technology and Sweden's Innovation Agency Vinnova.`,
    },
    prism: {
      theme: prismThemes.dracula,
    },
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
