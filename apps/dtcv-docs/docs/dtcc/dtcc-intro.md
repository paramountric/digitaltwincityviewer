# Introduction

The [DTCC Platform](https://platform.dtcc.chalmers.se/) is a main development effort of the [DTCC project](https://dtcc.chalmers.se/). A part of the DTCV project has been to develop a user centric workflow on top of the DTCC Platform.

The essential processing functionality of DTCC Platform lies in the DTCC Core - a set of processes to generate geospatial digital twin city 3D data from raw data, including the Swedish national geographic data.

In DTCV project we provide examples and guidelines on how to build your own workflows connected to the DTCC Platform.

Read more about the DTCC Platform in the [DTCC documentation](https://platform.dtcc.chalmers.se/).

## How do we connect to the DTCC Core?

In the DTCV Platform we have created a service that runs when you start the platform. This is built on REST principles using FastAPI and exposes a port on localhost.

On top of that the Docker settings include a volume for both the source code and the data folder, so that this is accessible and persisted on the host machine.

This means that you can clone the repository and tweak the service as you see fit by changing the Python code. The code changes will automatically be reflected in the running service.

As for the input data and the output data for DTCC Core, you can manage this eighter by directly accessing the files manually, leveranging automation tasks or visualise the data in a web viewer.

### Example

📥 In this case the demo dataset is downloaded from the DTCC Platform, but you could also add the data directly to the local data folder:

`platform/volumes/dtcc/data`.

⚙️ Then the examples shows how to trigger the processing of the demo dataset and generate output files in .pb (protobuf) format.

🔄 As a next step to prepare the meshes for visualisation in the viewer, a conversion to .glb format is done.

🖥️ The viewer can then access the final 3D assets and show the result.

🤖 To showcase the workflow connection these steps where connected to an automation workflow using the n8n platform.
