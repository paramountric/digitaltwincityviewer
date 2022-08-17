// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Digital Twin City Viewer',
  tagline:
    'An open source toolkit for collaborative right-time city data online',
  url: 'https://digitaltwincityviewer.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'paramountric', // Usually your GitHub org/user name.
  projectName: 'digitaltwincityviewer', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/paramountric/digitaltwincityviewer/tree/main/website/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Digital Twin City Viewer',
        logo: {
          alt: 'DTCV Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/paramountric/digitaltwincityviewer',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Get started',
                to: '/docs/intro',
              },
              {
                label: 'Documentation',
                to: '/docs/intro',
              },
              {
                label: 'Tutorials',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Links',
            items: [
              {
                label: 'Digital Twin Cities Centre',
                href: 'https://dtcc.chalmers.se/',
              },
              {
                label: 'Paramountric',
                href: 'https://paramountric.com',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Paramountric. Built with support from Chalmers University of Technology and Sweden's Innovation Agency Vinnova.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
