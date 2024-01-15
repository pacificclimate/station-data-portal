# Project initialization

Initial steps taken to create the project

## Node.js and related tools

### `nvm`

To manage Node.js and its versions, we installed
[Node Version Manager (`nvm`)](https://github.com/creationix/nvm/blob/master/README.md),
following its installation script.

`nvm` installs Node.js and `npm`, so there is no need to install them first.

### Node virtual environments

At the moment, we don't need a virtual environment.
That seems likely to change, but for now `nvm` can probably serve as a weak but sufficient substitute.

[This article](https://www.develves.net/blogs/asd/2016-04-28-using-virtual-environments-nodejs/#nodejs-virtual-environments)
outlines the shortcomings of existing Node virtual environment tools.
Its [accompanying project](https://github.com/jenesuispasdave/using-virtual-environments) contains scripts that
implement its ideas. On shallow examination, it looks sound.

## Application skeleton

We used `create-react-app` to create an application skeleton.
We intend to follow its [instructions](create-react-app.md) closely as we build the project.
