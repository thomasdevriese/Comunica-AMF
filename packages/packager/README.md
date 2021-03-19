# Comunica Packager

[![npm version](https://badge.fury.io/js/%40comunica%2Fpackager.svg)](https://www.npmjs.com/package/@comunica/packager)

A tool for packaging Comunica modules in a single NPM package.

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

## Install

```bash
$ yarn add @comunica/packager
```

## Usage

Invoke the packager using a config file as follows:

```bash
$ comunica-package urn:comunica:my -c config/config-default.json -e urn:comunica:sparqlinit -o my-sparql-engine 
```

This will create a directory `my-sparql-engine` containing new `package.json` and `index.js` files.
