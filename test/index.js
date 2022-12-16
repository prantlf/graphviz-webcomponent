import tehanu from 'tehanu'
import { closeBrowser } from './support.js'
import './test-graph.js'
import './test-renderer.js'
import './test-script-editor.js'

tehanu('cleanup').after(closeBrowser)
