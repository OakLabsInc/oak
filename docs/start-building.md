# Start building

Here we will start with an application that simply displays a remote url inside of the electron engine that is inside of a docker container. This is what the file structure in our example looks like

[](https://www.notion.so/f1c88c37d4564c95b690e4ed9cd42cb5#72c8fb3f29514ecf8a381aa86dc6f9ce)

```text
- src
   |
   index.js
- README.md
- package.json
- Dockerfile
- docker-compose.yml

```

First, create a new directory where all the files would live. In this directory create a `package.json` file that describes your app and its dependencies by using `npm init` or simply copy the content of: 

    {
      "name": "app-example",
      "version": "0.0.1",
      "description": "App repository as an example",
      "main": "src/index.js",
      "engines": {
        "node": "8.11.3"
      },
      "dependencies": {
        "@oaklabs/platform": "~1.2.4",
        "lodash": "~4.17.10"
      },
      "devDependencies": {
        "oak": "XXX"
      },
      "scripts": {
        "start": "./node_modules/.bin/oak src/index.js",
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "repository": {
        "type": "git",
        "url": "git+https://github.com/oaklabsinc/app-mastercard.git"
      },
      "author": "",
      "license": "UNLICENSED",
      "bugs": {
        "url": "https://github.com/oaklabsinc/app-mastercard/issues"
      },
      "homepage": "https://github.com/oaklabsinc/app-mastercard#readme",
      "private": true
    }

Let's review the sections of this package.json file. 

- `name` is up to you
- `version` should increment as your updates happen
- `description` A good description of your application tells what the app does in a short sentence
- `engines` lists the engines used to produce this application. In this example we list node and the version used. This should also corospond to the `.nvmrc` file in this project.
- `dependencies` lists the `npm` pqackages necessary to run this application. In our case `@oaklabs/platform` is the gRPC connection
- `dev-dependencies` are thing that are only needed for the development environment.
- `scripts` containes commands that can be passed to `npm run`
- `repository` is the repo that hosts this code.
- `author` is the name and email address of the author. example: `Joe Smo <joe@smo.com>`
- `license` is the license that is associated with this distribution
- `bugs` is where to report bugs
- `homepage` is the home page of this project
- `private` is a boolean value that sets whether this project is public or not

With your new `package.json` file, run `npm install`. If you are using `npm` version 5 or later, this will generate a `package-lock.json` file which will be copied to your Docker image.

Then, create a folder `src` to hold all of your node application. Create serve `index.js`  file that defines a web app using the Oak framework:

    const oak = require('oak')

    const OakPlatform = require('@oaklabs/platform')

    oak.on('ready', () => {
      oak.load({
        url: process.env.REMOTE_URL || 'https://www.google.com/search?q=zivelo',
        size: '1080x1920'
      })
    })

In the next steps, we'll look at how you can run this app inside a Docker container using the official Docker image. First, you'll need to build a Docker image of your app.

## Creating a Dockerfile

Create an empty file called `Dockerfile`:

    touch Dockerfile

Open the `Dockerfile` in your favorite text editor. We like [Visual Studio Code](https://code.visualstudio.com/) by Microsoft. It works the same on OSX, Windows or Linux

The first thing we need to do is define from what image we want to build from. Here we will use the latest oak support:

    FROM oaklabs/oak:XXX

Next we create a directory to hold the application code inside the image, this will be the working directory for your application:

    # Create app directory
    WORKDIR /app

We copy all of the application to the `/app` directory and then run the `npm i` to install all of the node modules

    # Copy all of your files to /app
    COPY . /app

    RUN npm i --engine-strict=true --progress=false --loglevel="error" \
        && npm cache clean --force

We add an environmental variable that the app looks for to start the app with default url

    ENV REMOTE_URL=http://static.oak.host/signage/index.html

Define the command to run your app using `CMD` which defines your runtime.

    CMD [ "/app" ]

Your app binds to port `9999` so you'll use the `EXPOSE` instruction to have it mapped by the `docker` daemon:

    EXPOSE 9999

Your `Dockerfile` should now look like this:

    FROM oaklabs/oak:XXX

    WORKDIR /app
    COPY . /app

    RUN npm i --engine-strict=true --progress=false --loglevel="error" \
        && npm cache clean --force

    ENV REMOTE_URL=http://static.oak.host/signage/index.html

    CMD ["/app"]

    EXPOSE 9999

## docker-compose.yml

We like to use a docker compose file to run the container as the docker start up process can get complicated and docker-compose.yml is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application’s services. T.

    ---
    version: '2'
    services:
      app-example:
        build: .
        container_name: app-example
        image: oaklabs/app-example:latest
        network_mode: host
        devices:
          # remove if you dont need to share your graphics card explicitely
          - /dev/dri:/dev/dri
        volumes:
          - /tmp/.X11-unix:/tmp/.X11-unix
          - /dev/shm:/dev/shm

## .dockerignore file

Create a `.dockerignore` file in the same directory as your `Dockerfile` with following content:

    node_modules
    npm-debug.log

This will prevent your local modules and debug logs from being copied onto your Docker image and possibly overwriting modules installed within your image.

## **Install**

Please use `[nvm](https://github.com/creationix/nvm#install-script)` to install node.

    # use the node version for oak
    nvm use $(cat .nvmrc)

    # install dependencies
    npm install

    # rebuilds native modules for oak
    ./node_modules/.bin/oak-rebuild .

## **Running Locally**

    npm start
    # and to stop
    Control + c to stop

## Running in a Docker Container

    docker-compose up --build
    # and to stop
    Control + c
    Control + c
    docker-compose down