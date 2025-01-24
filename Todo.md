Todo:

- build the cli locally, pnpm script, into root folder
- add full mono repo with different example projects, + the ones developed in DTCC
- push to github, to test if the cli works from remote
- init with cli and make sure it downloads and links
- start with cli to see that docker runs the containers
- run the db tests and check the account syncing
- update speckle image
- run dtcc core
- run some n8n worker for processes

- use the cli to run the environment locally, which allows calling additional commands for example DTCC Core
- one runtime should be the host, having an ID that can be shared to others
- one app should be deployed online to give access to the web frontend (simpler functionality) -> host in supabase online
- can n8n interface be exposed online, or only for the local user?
- assets are pushed through speckle, including the DTCC Core output
- so the online app is only for additional data on top of the assets, communication + geojson editing
- possibly some uploading of assets as well through online?
- the host need to act main server, how to deal with this? only one host runtime at one time?
- files? postgres? redis?

Docs:

- quick start
- platform
- - run the platform
- - capabilities
- - workflows
- - yaml spec
- - n8n converter
- service
- - dtcc core
- example apps
- - dod (add the source code)
- - dte (add the source code)
- - trecim (add the source code)
- - starter-app (dtcv app with signup, viewport, trigger DTCC Core, etc)
- - workflow-composer
- deployment
- - docker compose
- - kubernetes

auth:s

- add the migration for supabase to speckle to docker compose
- create a default registration process using the env vars for supabase admin
- - fill the n8n stuff out
- - create the speckle user record
- - create supabase user record so that the function triggers

services:

- run services on top of platform, like nodes triggered by webhooks
- can be integrated with webhooks of speckle and n8n

todo:

- workflows focus
- speckle connections
- services including python and DTCC Core

todo:

- run DTCC as a service in original setup (part of the platform!)
- create an app to show login
- create an app to create yaml workflow files (connect to common package to convert to n8n)
- - push the workflow to n8n, create visualisation using mermaid
- build an example app to use the DTCC Core output - GLTF visualisation
- connect to speckle web
- connect to QGIS or Blender?

- example realtime editor on the map? collect events (entities)
- - send directly to other frontend using precense
- - send through database changes
