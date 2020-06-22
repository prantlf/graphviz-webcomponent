import resolve from '@rollup/plugin-node-resolve'
import livereload from 'rollup-plugin-livereload'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import { spawn } from 'child_process'

const watch = process.env.ROLLUP_WATCH
const coverage = process.env.NODE_ENV === 'development'

export default [
  {
    input: 'src/index.js',
    output: {
      sourcemap: true,
      format: 'iife',
      file: 'dist/index.min.js'
    },
    plugins: [
      resolve(),
      coverage && babel({
        babelHelpers: 'bundled',
        plugins: ['istanbul']
      }),
      watch && serve(),
      watch && livereload('.'),
      !(watch || coverage) && terser({ output: { comments: false } })
    ],
    watch: { clearScreen: false }
  },
  {
    input: 'src/graph.js',
    output: {
      sourcemap: true,
      format: 'iife',
      file: 'dist/graph.min.js'
    },
    plugins: [terser({ output: { comments: false } })]
  },
  {
    input: 'src/script-editor.js',
    output: {
      sourcemap: true,
      format: 'iife',
      file: 'dist/script-editor.min.js'
    },
    plugins: [resolve(), terser({ output: { comments: false } })]
  }
]

function serve () {
  let started = false
  return {
    writeBundle () {
      if (started) return
      started = true
      spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      })
    }
  }
}
