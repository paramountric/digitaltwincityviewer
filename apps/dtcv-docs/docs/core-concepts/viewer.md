# Viewer

At the core of the DTCV project is the viewer capabilities. Initially an attempt to build an open source "viewer to rule them all" we realised that time and resources worked against us. The reasoning after these insight is that time and resources will always be challenging for complex viewer projects, and a more modular approach would be better.

Starting out with a wrapper around Luma.gl we moved to creating a wrapper around Deck.gl. Chosing between Three.js and Deck.gl we saw that Deck.gl has more support out of the box for map layers and help libraries for geospatial data. The integration with MaplibreGL was also very useful as the MVT tiles is a very good format for 2.5D projects in digital twin city representations.

## Deck.gl

During 2022 the Deck.gl team and community did a great job of updating their code base, for example migrating to Typescript. The Digital Twin City Viewer (DTCV) has slowly migrating from being a wrapper around Luma.gl to be a wrapper around the Deck.gl layering system. This means that the concept of CompositeLayers was more and more used instead of writing layers from scratch on top of Luma. As of 2024 the support for WebGPU has also been released in early versions. The viewer implemenatations has gradually moved from detailed picky implementations to trying to embrace a simple integration with existing layer examples and work on top of MaplibreGL.

:::info
The strategy of the viewer is to leverage the examples of Deck.gl and make it easier for developers to expressively create their own layers on top of their data and use cases.
:::

This is also inspired by Kepler.gl that is also built on top of Deck.gl but is more of a data analysis tool to drop in your datasets.

Kepler.gl is a great way of exploring the capabilities of DTCV as the technology is the same behind the scenes.

![Kepler.gl](/img/kepler.gif)

## Viewer examples.

Outside of the specific DTCV [use cases](/docs/project-results/use-cases) and the examples, there are numerous resource online to get accustomed to the capabilities of Deck.gl.

Out of the box the Speckle platform offers a viewer to manage data and collaboration in AEC projects.

Since the viewer is tighly integrated with the Speckle Server, it is possible to use the Speckle Viewer as part of your workflow in DTCV Platform!

See the [Speckle integration example](/docs/examples/example-speckle) for more information.
