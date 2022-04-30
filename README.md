# Digital Twin City Viewer

The Digital Twin City Viewer is developed as part of the DTCC Platform, an open-source platform for the
exploration of digital twins for cities. The platform is developed and
maintained by the Digital Twin Cities Centre (DTCC) hosted by Chalmers
University of Technology. The aim is to develop an open multimodal
data, modeling, simulation and visualization platform for interactive
planning, design, exploration, experimentation and optimization of
cities.

This repository provides software for visualization and user interaction in browsers and non-native mobile devices. It also handles intermediate processing that is needed on the browser side or on the server side (using Node.js).

## Concept

This is a monorepo (using Lerna) with the aim to provide a future-proof environment where it's possible to develop parallel client applications without restrictions. The prediction is that requests for browser and mobile implementations and functionality in DTCC projects will come in continuously, and that the JS open source landscape will continue to evolve in rapid pace. The ambition is therefore not to build yet another monolithic application that is hard to maintain, but keep the best of both worlds:

1. Start writing JS code using whatever preference, but keep it in your own project folder
2. Use any of the common packages to avoid rewriting code if you wish
3. Write new or improve common packages as needed (following the agreed contribution rules)
4. Use a streamlined process to develop and deploy the application online

Another advantage of creating many projects is that is easier to look at other projects to get started quickly. Since JS community is moving in a rapid pace, it's becoming a habit to rewrite code or create new applications from scratch relatively quickly, both for good and bad. By streamlining the development and deployment process the different JS implementations in the DTCC, it's easier to create targeted solutions. This will be needed in a digital twin city implementation where the need for specific applications is beyond imagination.

## Getting started

These instructions will download and install the development environment and launch one of the projects that does not use any application server. For projects that use application server or other service dependencies, see _Projects with service dependencies_. For creating a new project, see _Create a new project_

### Downloading the software

To download the software, clone the repository by the following command:

    git clone https://github.com/paramountric/digitaltwincityviewer.git

Alternatively, you may want to use the SSH protocol:

    git clone git@github.com:paramountric/digitaltwincityviewer.git

This will create a directory named `digitaltwincityviewer` containing the full source code.

### Install the development environment

In the `digitaltwincityviewer` folder run:

    npm install

This will install the monorepo root dependencies and most of the dev dependences.

Then run:

    lerna bootstrap --hoist

This will run `npm install` in all configured subfolders and also generate symbolic links from within the node*modules folders where the local package.json in the subfolders have dependencies specified. \_Note that it's possible and likely that dependencies using the `@dtcc` namespace in the local package.json files are not published on NPM.*

Lerna will also "hoist" the dependencies so that common dependencies between projects and packages will only be installed at the root level.

### Run a project in development mode

From the `digitaltwincityviewer` root folder, browse to the project you want to run, in this case `citymodel-file-explorer`:

    cd projects/citymodel-file-explorer

Run the application, usually with:

    npm start

_Some projects might have other start commands for development, and the package.json file might need to be inspected to find out if that is the case_

Since the application use React.js the application should boot automatically. If not, navigate to `localhost:3000`.

## Create new project

After following the gettings started instructions and understanding the concept of the repo, it's possible to add new applications (projects). These instructions will explain the process of creating a browser application without application backend. Note that some applications could potentially connect to Core API without the need of running an application server.

WIP: step-by-step guide

## Projects with service depencencies

The most basic setup of a JS application is to run pure browser executed code by delivering a index.html file, a bundled javascript file and some other file assets. This application can call any servers or services on the internet using cross origin principles (CORS). The application is then a _serverless_ application and can also be deployed on static file storage, for example AWS S3. However the development runtime has to run against those online services, and if you are the maintainer of the service and if it's developed within the JS DTCC scope, it can be a better idea to develop and host the source code of the service application in the JS repo. This is done in the `services` folder (Note that services could also be hosted in other repos, such as the Core API).

In the case where you need an application backend server, an API or any other services it's preferable to use Docker for development. Another option would be to start the services directly inside the services folder before starting the frontend project application. However, Docker is the general recommened approach for the development.

### Setup a project with local service dependencies

WIP: step-by-step guide

### Run a project with local dependencies

WIP: step-by-step guide

## Run tests

Tests can be run in the root folder by using the command `npm run test`. This will trigger `jest --watchAll`, and files containing postfix of _.test.js_ and are configured through the path in the _jest.config.js_ file will run continuously when the files are saved. If you work on code that are covered by tests, it's recommented to run the tests in a separate terminal window during developement to make sure the tests passes.

## Linting

Linting is not yet setup for the repo, and the code is starting to have issues with formatting. As soon as possible we should have a discussion of the linting rules and force this to the packages and selected projets. The rules will support the currently written syntax to great extent.

## Lerna - short version

Using Lerna (https://lerna.js.org/), the NPM modules can be hosted locally separated from the projects in the same code base using symbolic links during development. Linking are commonly done form the _node_modules_ folder in the projects to the _packages_ folder in the root of the repo. This means that Lerna will run npm install for each configured package.json, and first check if the module dependency exist in the repo, and if not, check in the NPM registry.

### Pros

- It's possible to do development in the project and the (separate) modules at the same time just like if it was in the same folder
- You can split modules to smaller entities if they grow too big without increasing the complexity that much. Especially compared to running against the NPM registry.
- One repo for all JS code can be easier to manage than many repos

### Cons

- The setup is more tedious
- The repo will grow very big, which can then make it harder to manage than separate repos

(to be filled with more pros and cons to give an idea of what to expect when starting to work with this repo)

## Publish packages on NPM

WIP: Describe the Lerna process of publish to NPM

Note: publish on NPM is often not needed since the JS code is linked from project code to module code within the repo during development. For deployment the JS compilers will bundle the project and the module code during the build step (without need to npm install them from NPM).

## License

The DTCC Platform is licensed under the [MIT
license](https://opensource.org/licenses/MIT).

Copyright is held by the individual authors as listed at the top of
each source file.

## Acknowledgments

This work is part of the Digital Twin Cities Centre supported by
Sweden’s Innovation Agency Vinnova under Grant No. 2019-421 00041.
