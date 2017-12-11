# Darkest Dungeon
A Darkest Dungeon clone built with web technology.

## About the project

### Why make a game using standard web tech?

Most web games are built using canvas or webgl, but there are still lots of suitable game ideas that still work great with standard web tech, and I'd like to demonstrate how to do that!

It's also my favorite technology, and I recently did some professional work using this tech stack to build game UIs, and I'd like to share that experience with the community.


### Why Darkest Dungeon?
Because of it's simplistic design style, making it a perfect candidate for a web based game. It also has a fairly small scope, making me feel like it should be possible to finish in one month.

### Legal issues?

This project is purely for fun and educational purposes, not to create a competitor to Darkest Dungeon. If it would turn out Red Hook Studios has an issue with this project however, I'll shut it down.


## Getting started

> You need to own and have a local installation of Darkest Dungeon on your device. This is because this project relies on assets imported from Darkest Dungeon. If you do not own Darkest Dungeon you will need to modify this project with your own assets.

- Install a package manager (ie. [npm](https://www.npmjs.com)) on your machine
- Clone this repository
- Run `npm install` in the project root folder (or the equivalent of the package manager of your choice)
- Run `ts-node ./dev/importAssets.ts <path-to-steam-directory>`

> Requires [SoX](http://sox.sourceforge.net/) CLI to be installed

> Don't have webpack-dev-server running while importing as this might interfere with the file system.

- Run `npm run dev-server` in the project root folder
- Visit `localhost:8080` in your browser
