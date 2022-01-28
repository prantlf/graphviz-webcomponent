# graphviz-webcomponent

[![npm](https://img.shields.io/npm/v/graphviz-webcomponent)](https://www.npmjs.com/package/graphviz-webcomponent#top)
[![codecov](https://codecov.io/gh/prantlf/graphviz-webcomponent/branch/master/graph/badge.svg)](https://codecov.io/gh/prantlf/graphviz-webcomponent)
![Dependency status](https://img.shields.io/librariesio/release/npm/graphviz-webcomponent)
[![codebeat badge](https://codebeat.co/badges/9d85c898-df08-42fb-8ab9-407dc2ce2d22)](https://codebeat.co/projects/github-com-prantlf-graphviz-webcomponent-master)

[WebComponents] for rendering a [Graphviz] graph and for editing its source script with syntax highlighting. Uses [@hpcc-js/wasm] to generate the graph image in the web browser using [WASM]. See it working [on-line]!

Features:

* Lightweight [WebComponents] (graph 2.0 kB minified, 0.9 kB gzipped, script editor 24.6 kB minified, 9.2 kB gzipped).
* Renderer downloaded in the background (1.0 MB minified, 472.9 kB gzipped).

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
<script defer src=https://unpkg.com/graphviz-webcomponent@0.5.0/dist/graph.min.js></script>
```

Show a script editor and render the edited content to a graph:

```html
<graphviz-script-editor id=source value="
  digraph G {
    main -> parse -> execute;
    main -> cleanup;
  }
"></graphviz-script-editor>
<graphviz-graph id=graph></graphviz-graph>
<script type=module>>
  import 'https://unpkg.com/graphviz-webcomponent@0.5.0/dist/index.min.mjs'
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
<script src=https://unpkg.com/graphviz-webcomponent@0.5.0/dist/index.min.js></script>
<script src=node_modules/graphviz-webcomponent/dist/index.min.js></script>
```

Distributed scripts:

* `index.min.js` - both `graphviz-graph` and `graphviz-script-editor` elements
* `graph.min.js` - the `graphviz-graph` element
* `script-editor.min.js` - the `graphviz-script-editor` element
* `renderer.min.js` - web worker for the `graphviz-graph` element

The first three scripts are available as ES6 modules with the file extension `.mjs` too. They export the HTML elements as classes.

## Elements

### graphviz-graph

The custom element `graphviz-graph` generates an SVG and displays it in its shadow root.

```html
<graphviz-graph graph="..." scale="..."></graphviz-graph>
```

#### Attributes

The attribute `graph` supplies the graph script in the [Graphviz] format. Whenever the `graph` attribute changes, the graph will be re-generated and re-rendered. If it is empty, the `graphviz-graph` will be empty. If rendering of the graph image fails, the element will display the error message.

The attribute `scale` sets the "zoom" level to the SVG content. It has to be convertible to a real number greater than `0`. Values in the interval `(0;1>)` decrease the image size, values greater than `1` increase it. The default value is `1`, which means the original size. The value can be convertent to percents of the original size by multiplying by `100`.

#### Events

Whenever the SVG inside the `graphviz-graph` element is successfully updated, the custom event `render` with the SVG source as details will be triggered on the element. If the rendering fails, the custom event `error` with the `Error` instance as details will be triggered.

#### Methods

The method `tryGraph(graph: string): Promise<string>` can be called to conditionally set the `graph` attribute. If rendering the graph script succeeds, the input value will be set to the `graph` attribute, the `graphviz-graph` element will be updated (including triggering the `render` event) and the Promise will be resolved with the output SVG. If rendering the graph script fails, the `graphviz-graph` element will remain unchanged (no `error` event triggered) and the Promise will be rejected with the error.

#### Configuration

The `graphviz-graph` element uses a [Web Worker] to perform the rendering in the background and [WASM] to improve the computation performance. These two external scripts are loaded from URLs, which can be customized. The defaults are:

```js
graphvizWebComponent = {
  rendererUrl: 'https://unpkg.com/graphviz-webcomponent@1.4.0/dist/index.min.js',
  wasmFolder: 'https://unpkg.com/@hpcc-js/wasm@1.12.8/dist',
  delayWorkerLoading: false
}
```

The global object `graphvizWebComponent` can be set *before the `graphviz-webcomponent` scripts (`index.min.js` or `graph.min.js`) are imported* to change the defaults. Changing the properties after the sctips are loaded will have no effect.

If you set `graphvizWebComponent.delayWorkerLoading` to true, the web worker will be downloaded when the first `graphviz-graph` element will be inserted to the page.

If you want to enforce only local resources, you can change the URLsto relative paths within your project by setting the global `graphvizWebComponent` object, for example:

```html
<script>
  graphvizWebComponent = {
    rendererUrl: '../node_modules/graphviz-webcomponent/dist/renderer.min.js',
    wasmFolder: '../node_modules/@hpcc-js/wasm/dist'
  }
</script>
```

### graphviz-script-editor

The custom element `graphviz-script-editor` shows a graph script with syntax highlighting and allows its editing.

```html
<graphviz-script-editor value="..." tab="..." class="..."></graphviz-graph>
```

#### Attributes

The attribute `value` accepts the graph script in the [Graphviz] format. Whenever the `value` attribute changes, the editor will be re-rendered. The `value` attribute reflects the immediate changes made in the editor.

The attribute `tab` can specify characters inserted when the `Tab` key is pressed. It is two spaces (`"  "`) by default.

The attribute `class` can control features by special class names:

* `line-numbers` will add line numbers to tyhe left border of the editor.
* `match-braces` will show the second brace brace, when the first one is hovered above.
* `rainbow-braces` will show pairs of braces with different colours..

#### Events

Whenever the content of the editor changes, the custom event `input` with the source script as details will be triggered on the element. The attribute `value` will contain the latest editor content.

## License

Copyright (c) 2020-2022 Ferdinand Prantl

Licensed under the MIT license.

[on-line]: https://prantlf.github.io/graphviz-webcomponent
[Graphviz]: https://graphviz.org/
[WebComponents]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
[WebComponent]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
[Web Worker]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
[WASM]: https://developer.mozilla.org/en-US/docs/WebAssembly
[@hpcc-js/wasm]: https://github.com/hpcc-systems/hpcc-js-wasm#readme
[graphviz-builder]: https://github.com/prantlf/graphviz-builder#readme
[graphviz-cli]: https://github.com/prantlf/graphviz-cli#readme
[Node.js]: https://nodejs.org/
[NPM]: https://docs.npmjs.com/cli/npm
[Yarn]: https://classic.yarnpkg.com/docs/cli/
[PNPM]: https://pnpm.js.org/pnpm-cli
