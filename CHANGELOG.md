# [1.0.0](https://github.com/prantlf/graphviz-webcomponent/compare/v0.5.1...v1.0.0) (2022-12-16)


### Bug Fixes

* Upgrade dependencies ([6cf8f43](https://github.com/prantlf/graphviz-webcomponent/commit/6cf8f435c762014237e458a54e9975351de51abe))


### Features

* Add property graphCompleted ([8ccca85](https://github.com/prantlf/graphviz-webcomponent/commit/8ccca8520c423f261fc2b2bb060b8d31e315e4d9))
* Remove wasmFolder from configuration ([c91e849](https://github.com/prantlf/graphviz-webcomponent/commit/c91e849b823193ca9e8374f071c5134b7351c6eb))


### BREAKING CHANGES

* The value of `wasmFolder` will be ignored. Simply stop passing this input parameter in. This shouldn't break anything, but you might want to simplify your code.

## [0.5.1](https://github.com/prantlf/graphviz-webcomponent/compare/v0.5.0...v0.5.1) (2022-01-28)


### Bug Fixes

* Fix published version number ([ccf42ce](https://github.com/prantlf/graphviz-webcomponent/commit/ccf42cea1d75221e2319a530aada53ef13201b50))

# [0.5.0](https://github.com/prantlf/graphviz-webcomponent/compare/v0.4.2...v0.5.0) (2022-01-28)


### Bug Fixes

* Adapt sources after upgrading dependencies ([51a5492](https://github.com/prantlf/graphviz-webcomponent/commit/51a54926bbe431fa8e595366c59a64ee897cc622))
* Preload the renderer out of the execution of the main script ([9611670](https://github.com/prantlf/graphviz-webcomponent/commit/96116707b032ad8b7d4a0132c8580f52ed531b67))
* Publish with new dependencies ([43f17de](https://github.com/prantlf/graphviz-webcomponent/commit/43f17def34f9c594b1575947c89b9e63cf2f9846))


### Features

* Add ES6 modules exporting the HTML element classes ([bb62fc6](https://github.com/prantlf/graphviz-webcomponent/commit/bb62fc6e86c7cdc94d2a22cf96b06cb7e87e7ba8))

## [0.4.2](https://github.com/prantlf/graphviz-webcomponent/compare/v0.4.1...v0.4.2) (2020-07-03)

## Performance

* Drop the dependency on lit-html to shrink the size by 20 KB ([43306a8](https://github.com/prantlf/graphviz-webcomponent/commit/43306a83bb9e1fefa89f1c6631e2a621683d55b9))

## [0.4.1](https://github.com/prantlf/graphviz-webcomponent/compare/v0.4.0...v0.4.1) (2020-07-02)

## Bug Fixes

* Correct the access to the text selection to enable running in Firefox ([c9f3649](https://github.com/prantlf/graphviz-webcomponent/commit/c9f3649e7fd30b59da14ba094cc46a3c01f9c6b1))

## [0.4.0](https://github.com/prantlf/graphviz-webcomponent/compare/v0.3.1...v0.4.0) (2020-07-02)

## Features

* Render the graph by a web worker, configure it by a global object ([6833d6c](https://github.com/prantlf/graphviz-webcomponent/commit/6833d6c66308c44197c19a6bfb6a062dd0f6556d))

## [0.3.1](https://github.com/prantlf/graphviz-webcomponent/compare/v0.3.0...v0.3.1) (2020-06-22)

## Bug Fixes

* Set the scale transformation origin to the top left corner ([a0006a0](https://github.com/prantlf/graphviz-webcomponent/commit/a0006a01e960c380d6e6602c441fce2ccef15e81))

## [0.3.0](https://github.com/prantlf/graphviz-webcomponent/compare/v0.2.0...v0.3.0) (2020-06-22)

### Features

* Introduce attribute "scale" for zooming the graph image ([fc13ea4](https://github.com/prantlf/graphviz-webcomponent/commit/fc13ea40d8ef74aa36b630c0b0bf6a34fa7baed4))

## [0.2.0](https://github.com/prantlf/graphviz-webcomponent/compare/v0.1.0...v0.2.0) (2020-06-22)

### Features

* Add syntax highglighting for the graph script, add button "Save script" ([06a9b41](https://github.com/prantlf/graphviz-webcomponent/commit/06a9b41c368cc9cba5a8f1ed5780f34693ac0993))
* Introduce Web component for editing the script source ([d2efcc1](https://github.com/prantlf/graphviz-webcomponent/commit/d2efcc1f574013ebac9e831a6331f92d503fc312))

## [0.1.0](https://github.com/prantlf/graphviz-webcomponent/compare/v0.0.1...v0.1.0) (2020-06-15)

### Features

* Add method tryGraph to update the graph only if rendering succeeds ([cb35099](https://github.com/prantlf/graphviz-webcomponent/commit/cb35099824ec62512883fcc5f977ab9a5f86bdbc))
* Render the graph on any change in the graph script text area ([ff5616f](https://github.com/prantlf/graphviz-webcomponent/commit/ff5616f9f726cee02c104eec6f1536754457b00c))

## 0.0.1 (2020-06-1)

Initial release of the Graphviz WebComponent
