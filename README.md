![dtcv-flash-img](https://user-images.githubusercontent.com/3265950/166108531-b2e2bd4b-afe2-422f-a0ae-b14fb2492605.png)

# Digital Twin City Viewer

The Digital Twin City Viewer is developed as part of the DTCC Platform, an open-source platform for the
exploration of digital twins for cities. However, it's also designed to be used standalone or as a part of any other system setup that uses open standards for data exchange.

**A core feature of the Digital Twin City Viewer is that it enables "right-time" data sharing in a decentralized fashion.**

More information on how this work will come later.

## Status

This project runs between 2022-2024 and has shown most progress so far in projects connected to DTCC and other research projects. The subprojects can be found in the projects folder.

The process has been to try to solve specific project and domain issues in customized applications and reuse functionality in the packages folder. It's a tricky balance to generalize the functionality and there has been a bit back and forth.

Starting out with a low level approach using Luma.gl, finally Deck.gl was selected due to the useful Layer abstraction and the AttributeManager. It has been a challenge to determine the best state management approach, and finally most of the state management has been refactored out from the Viewer component and put into the applications.

The application examples are mostly refactored from a web components approach to using Next.js. This is because Next.js has an excellent way to work with application level backend. Backend logic is otherwise generalized into the services folder, having a micro service approach in mind for deployment.

Some of the applications really benefit from using Maplibre and MVT tiles. This means that the viewer component can optionally be initialised with Mablibre.

A few applications have been deployed at this stage, unfortunately due to data license issues the examples are not publicly accessible.

## DTCC Platform

The DTCC Platform is developed and maintained by the Digital Twin Cities Centre (DTCC) hosted by Chalmers
University of Technology. The aim is to develop an open multimodal
data, modeling, simulation and visualization platform for interactive
planning, design, exploration, experimentation and optimization of cities.

[Read more about DTCC](https://dtcc.chalmers.se/)

## License

The DTCC Platform is licensed under the [MIT
license](https://opensource.org/licenses/MIT).

Copyright is held by the individual authors as listed at the top of
each source file.

## Acknowledgements

This work has been created as part the Digital Twin Cities Centre (DTCC) hosted by Chalmers University of Technology and with funding from
Sweden’s Innovation Agency Vinnova.
