import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docs: [
    "intro",
    "project-background",
    {
      type: "category",
      label: "Project results",
      items: [
        "project-results/use-cases",
        "project-results/design-and-data",
        "project-results/ontologies",
      ],
    },
    {
      type: "category",
      label: "Core Concepts",
      items: [
        "core-concepts/customisation",
        "core-concepts/local-first",
        "core-concepts/viewer",
        "core-concepts/platform",
        "core-concepts/database-concepts",
        "core-concepts/automation",
        "core-concepts/monorepo",
        "core-concepts/modules",
      ],
    },
    {
      type: "category",
      label: "DTCC Platform",
      items: ["dtcc/dtcc-intro", "dtcc/dtcc-platform", "dtcc/dtcc-api"],
    },
    {
      type: "category",
      label: "Reference",
      items: [
        "reference/getting-started",
        "reference/examples",
        "reference/explore-db",
        "reference/data-model",
        "reference/auth",
        "reference/realtime",
        "reference/fileupload",
        "reference/workflows",
        "reference/speckle",
        "reference/deployment",
      ],
    },
    // {
    //   type: "category",
    //   label: "Examples",
    //   items: [
    //     "examples/example-auth-flow",
    //     "examples/example-dtcc-core",
    //     "examples/example-dte",
    //     "examples/example-redap",
    //     "examples/example-3d-tiles",
    //     "examples/example-speckle",
    //   ],
    // },
    {
      type: "category",
      label: "API",
      items: [
        "api/api-intro",
        "api/api-supabase",
        "api/api-speckle",
        "api/api-n8n",
      ],
    },
    "license",
  ],
};

export default sidebars;
