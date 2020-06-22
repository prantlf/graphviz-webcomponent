# graphviz-webcomponent

[![npm](https://img.shields.io/npm/v/graphviz-webcomponent)](https://www.npmjs.com/package/graphviz-webcomponent#top)
[![Build Status](https://travis-ci.org/prantlf/graphviz-webcomponent.svg?branch=master)](https://travis-ci.org/prantlf/graphviz-webcomponent)
[![codecov](https://codecov.io/gh/prantlf/graphviz-webcomponent/branch/master/graph/badge.svg)](https://codecov.io/gh/prantlf/graphviz-webcomponent)
[![codebeat badge](https://codebeat.co/badges/9d85c898-df08-42fb-8ab9-407dc2ce2d22)](https://codebeat.co/projects/github-com-prantlf-graphviz-webcomponent-master)
[![Dependency Status](https://david-dm.org/prantlf/graphviz-webcomponent.svg)](https://david-dm.org/prantlf/graphviz-webcomponent)
[![devDependency Status](https://david-dm.org/prantlf/graphviz-webcomponent/dev-status.svg)](https://david-dm.org/prantlf/graphviz-webcomponent#info=devDependencies)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[WebComponents] for rendering a [Graphviz] graph and for editing its source script with syntax highlighting. Uses [@hpcc-js/wasm] to generate the graph image in the web browser using [WASM]. See it working [on-line]!

Features:

* Lightweight [WebComponents] (graph 1.7 kB minified, 0.8 kB gzipped, script editor 42.5 kB minified, 14.7 kB gzipped).
* Renderer downloaded in the background (1.1 MB minified, 440 kB gzipped).

Related tools:

* [graphviz-builder] - generates the source script for [Graphviz] consumable by this [WebComponent]
* [graphviz-cli] - command-line tool for generating graph images from the source scripts

## Synopsis

Render a graph:

```html
<graphviz-graph graph="
  digraph G {
    main -> parse -> execute;
    main -> cleanup;
  }
"></graphviz-graph>
<script defer src=https://unpkg.com/graphviz-webcomponent@0.2.0/dist/graph.min.js></script>
```

Show an editor and render the edited content to a graph:

```html
<graphviz-script-editor id=source  value="
  digraph G {
    main -> parse -> execute;
    main -> cleanup;
  }
"></graphviz-script-editor>
<graphviz-graph id=graph></graphviz-graph>
<script type=module>>
  import 'https://unpkg.com/graphviz-webcomponent@0.2.0/dist/index.min.js'
  document.getElementById('source').addEventListener('input', event =>
    document.getElementById('graph').graph = event.details)
</script>
```

## Installation

Make sure that you have installed [Node.js]. Use your favourite package manager ([NPM], [Yarn] or [PNPM]) to add the `graphviz-webcomponent` module to your project. Add `-D` on the command line if you use a bundler:

```
npm i graphviz-webcomponent
yarn add graphviz-webcomponent
pnpm i graphviz-webcomponent
```

If you write a plain HTML page, insert the `graphviz-webcomponent` script pointing either to CDN or to the local filesystem:

```html
<script src=https://unpkg.com/graphviz-webcomponent@0.2.0/dist/index.min.js></script>
<script src=node_modules/graphviz-webcomponent/dist/index.min.js></script>
```

Distributed scripts:

* `index.min.js` - both `graphviz-graph` and `graphviz-script-editor` elements
* `graph.min.js` - the `graphviz-graph` element
* `script-editor.min.js` - the `graphviz-script-editor` element

## Elements

### graphviz-graph

The custom element `graphviz-graph` generates an SVG and displays it in its shadow root.

```html
<graphviz-graph graph="..." wasmFolder="..."></graphviz-graph>
```

#### Attributes

The attribute `graph` supplies the graph script in the [Graphviz] format. It can span over multiple lines. Do not forget to escape ampersand, quotation marks and other sensitive characters by HTML entities. Whenever the `graph` attribute changes, the graph will be re-generated and re-rendered. If it is empty, the `graphviz-graph` will be empty. If rendering of the graph image fails, the element will display the error message.

The attribute `wasmFolder` can specify URL to the directory where `@hpcc-js/wasm` is deployed. The default value is `https://unpkg.com/@hpcc-js/wasm@0.3.14/dist`. If this attribute is used, all `graphviz-graph` have to contain the same value and this value has to be set when the elements are created. Later changes of this attribute will have no effect.

#### Events

Whenever the SVG inside the `graphviz-graph` element is successfully updated, the custom event `render` with the SVG source as details will be triggered on the element. If the rendering fails, the custom event `error` with the `Error` instance as details will be triggered.

The very first `graphviz-graph` element will load [@hpcc-js/wasm] and once it succeeds, the custom event `GraphvizLoaded` will be triggered on `document` with the source [@hpcc-js/wasm] directory as details. If the loading fails, the custom event `error` with the `Error` instance as details will be triggered.

#### Methods

The method `tryGraph(graph: string): Promise<string>` can be called to conditionally set the `graph` attribute. If rendering the graph script succeeds, the input value will be set to the `graph` attribute, the `graphviz-graph` element will be updated (including triggering the `render` event) and the Promise will be resolved with the output SVG. If rendering the graph script fails, the `graphviz-graph` element will remain unchanged (no `error` event triggered) and the Promise will be rejected with the error.

### graphviz-script-editor

The custom element `graphviz-script-editor` shows a graph script with syntax highlighting and allows its editing.

```html
<graphviz-script-editor value="..." tab="..." class="..."></graphviz-graph>
```

#### Attributes

The attribute `value` accepts the graph script in the [Graphviz] format. It can span over multiple lines. Do not forget to escape ampersand, quotation marks and other sensitive characters by HTML entities. Whenever the `value` attribute changes, the editor will be re-rendered. The `value` attribute reflects the immediate changes made in the editor.

The attribute `tab` can specify characters inserted when the `Tab` key is pressed. It is two spaces (`"  "`) by default.

The attribute `class` can control features by special class names:

* `line-numbers` will add line numbers to tyhe left border of the editor.
* `match-braces` will show the second brace brace, when the first one is hovered above.
* `rainbow-braces` will show pairs of braces with different colours..

#### Events

Whenever the content of the editor changes, the custom event `input` with the source script as details will be triggered on the element. The attribute `value` will contain the latest editor content.

## License

Copyright (c) 2020 Ferdinand Prantl

Licensed under the MIT license.

[on-line]: https://prantlf.github.io/graphviz-webcomponent
[Graphviz]: https://graphviz.org/
[WebComponents]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
[WebComponent]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
[WASM]: https://developer.mozilla.org/en-US/docs/WebAssembly
[@hpcc-js/wasm]: https://github.com/hpcc-systems/hpcc-js-wasm#readme
[graphviz-builder]: https://github.com/prantlf/graphviz-builder#readme
[graphviz-cli]: https://github.com/prantlf/graphviz-cli#readme
[Node.js]: https://nodejs.org/
[NPM]: https://docs.npmjs.com/cli/npm
[Yarn]: https://classic.yarnpkg.com/docs/cli/
[PNPM]: https://pnpm.js.org/pnpm-cli
