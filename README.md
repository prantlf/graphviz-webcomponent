# graphviz-webcomponent

[![npm](https://img.shields.io/npm/v/graphviz-webcomponent)](https://www.npmjs.com/package/graphviz-webcomponent#top)
[![Build Status](https://travis-ci.org/prantlf/graphviz-webcomponent.svg?branch=master)](https://travis-ci.org/prantlf/graphviz-webcomponent)
[![codecov](https://codecov.io/gh/prantlf/graphviz-webcomponent/branch/master/graph/badge.svg)](https://codecov.io/gh/prantlf/graphviz-webcomponent)
[![codebeat badge](https://codebeat.co/badges/9d85c898-df08-42fb-8ab9-407dc2ce2d22)](https://codebeat.co/projects/github-com-prantlf-graphviz-webcomponent-master)
[![Dependency Status](https://david-dm.org/prantlf/graphviz-webcomponent.svg)](https://david-dm.org/prantlf/graphviz-webcomponent)
[![devDependency Status](https://david-dm.org/prantlf/graphviz-webcomponent/dev-status.svg)](https://david-dm.org/prantlf/graphviz-webcomponent#info=devDependencies)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[WebComponent] for rendering a [Graphviz] graph from the source script to SVG. Uses [@hpcc-js/wasm] to generate the graph image in the web browser using [WASM]. See it working [on-line]!

Related tools:

* [graphviz-builder] - generates the source script for [Graphviz] consumable by this [WebComponent]
* [graphviz-cli] - command-line tool for generating graph images from the source scripts

## Synopsis

```html
  <graphviz-graph graph="
    digraph G {
      main -> parse -> execute;
      main -> cleanup;
    }
  "></graphviz-graph>
  <script defer src=https://unpkg.com/graphviz-webcomponent@0.1.0/dist/index.min.js></script>
```

## Installation

Make sure that you have installed [Node.js]. Use your favourite package manager ([NPM], [Yarn] or [PNPM]) to add the `graphviz-webcomponent` module to your project. Add `-D` on the command line if you use a bundler:

```
npm i graphviz-webcomponent
yarn add graphviz-webcomponent
pnpm i graphviz-webcomponent
```

If you write a plain HTML page, insert the `graphviz-webcomponent` script pointing wither to CDN or to the local filesystem:

```html
<script src=https://unpkg.com/graphviz-webcomponent@0.1.0/dist/index.min.js></script>
<script src=node_modules/graphviz-webcomponent/dist/index.min.js></script>
```

## API

### Element

The custom element `graphviz-graph` generates an SVG and displays it in its shadow root.

```html
<graphviz-graph graph="..." wasmFolder="..."></graphviz-graph>
```

### Attributes

The attribute `graph` supplies the graph script in the [Graphviz] format. It can span over multiple lines. Do not forget to escape ampersand, quotation marks and other sensitive characters by HTML entities. Whenever the `graph` attribute changes, the graph will be re-generated and re-rendered. If it is empty, the `graphviz-graph` will be empty. If rendering of the graph image fails, the element will display the error message.

The attribute `wasmFolder` can specify URL to the directory where `@hpcc-js/wasm` is deployed. The default value is `https://unpkg.com/@hpcc-js/wasm@0.3.14/dist`. If this attribute is used, all `graphviz-graph` have to contain the same value and this value has to be set when the elements are created. Later changes of this attribute will have no effect.

### Events

Whenever the SVG inside the `graphviz-graph` element is successfully updated, the custom event `render` with the SVG source as details will be triggered on the element. If the rendering fails, the custom event `error` with the `Error` instance as details will be triggered.

The very first `graphviz-graph` element will load [@hpcc-js/wasm] and once it succeeds, the custom event `GraphvizLoaded` will be triggered on `document` with the source [@hpcc-js/wasm] directory as details. If the loading fails, the custom event `error` with the `Error` instance as details will be triggered.

### Methods

The method `tryGraph(graph: string): Promise<string>` can be called to conditionally set the `graph` attribute. If rendering the graph script succeeds, the input value will be set to the `graph` attribute, the `graphviz-graph` element will be updated (including triggering the `render` event) and the Promise will be resolved with the output SVG. If rendering the graph script fails, the `graphviz-graph` element will remain unchanged (no `error` event triggered) and the Promise will be rejected with the error.

## License

Copyright (c) 2020 Ferdinand Prantl

Licensed under the MIT license.

[on-line]: https://prantlf.github.io/graphviz-webcomponent
[WebComponent]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
[WASM]: https://developer.mozilla.org/en-US/docs/WebAssembly
[@hpcc-js/wasm]: https://github.com/hpcc-systems/hpcc-js-wasm#readme
[graphviz-builder]: https://github.com/prantlf/graphviz-builder#readme
[graphviz-cli]: https://github.com/prantlf/graphviz-cli#readme
[Node.js]: https://nodejs.org/
[NPM]: https://docs.npmjs.com/cli/npm
[Yarn]: https://classic.yarnpkg.com/docs/cli/
[PNPM]: https://pnpm.js.org/pnpm-cli
[API]: #api
