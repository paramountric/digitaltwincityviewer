---
sidebar_position: 1
---

# Intro

Welcome! The Digital Twin City Viewer project is still in an early stage, started in 2022.

This documentation is going to be updated as the functionality is getting more stable. Any contributions to documentation is also welcome!

Head over to [GitHub](https://github.com/paramountric/digitaltwincityviewer/issues) for discussions and issues.

## Status (end of 2022)

During 2022 the Deck.gl team and community did a great job of updating their code base, for example migrating to Typescript. The Digital Twin City Viewer (DTCV) has slowly migrating from being a wrapper around Luma.gl to be a wrapper around the Deck.gl layering system. This means that the concept of CompositeLayers are more and more used instead of writing layers from scratch on top of Luma.

### Layers

The strategy is then to let applications use custom DTCV composite layers, or existing Deck.gl layers, using a JSON abstraction (application do not need to instantiate layers). The good thing is that applications CAN use anything in properties since the JSON converter will leave instatiated members of the props object for the setProps function. In addition the setProps can be called directly from the application which makes the viewer component as flexible as Deck.gl.

### View state

The view state management is still a part of the Viewer component state, as a helper utility for the application to not need to provide the full state. Instead an easier way is provided, setZoom, setCenter, etc. Like the Layers api, the View instance and state can be provided directly using the setProps function.

### Plans for tiles

During next year, a tiling system will be implemented. Since the DTCV is supposed to support datasets from decentralised sources, a dynamic tiling mechnaism is needed. The best track so far is to use the ideas from 3D Tiles Next, where glTF assets can be built and cached dynamically in the viewer backend.

### Plans for data publishing

To facilitate data sharing a "publisher" or "provider" app will be created. This means that the users will run a certain application locally in "dev mode". This app can be used to validate user data source and be part of a pipeline (headless) to let central compoents of the DTCV know about new versions of data coming in. The actual data (and meta data) will be optimised for DTCV and published to the users own storage.
