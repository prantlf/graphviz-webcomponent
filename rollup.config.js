import resolve from '@rollup/plugin-node-resolve'
import livereload from 'rollup-plugin-livereload'
import istanbul from 'rollup-plugin-istanbul'
import { terser } from 'rollup-plugin-terser'
import { string } from 'rollup-plugin-string'
import { spawn } from 'child_process'

const watch = process.env.ROLLUP_WATCH
const coverage = process.env.NODE_ENV === 'development'
const instanbulOptions = { exclude: ['src/codejar/*', 'src/prism/*', 'test/**/*.js'] }
const terserOptions = { output: { comments: false } }
const stringOptions = { include: '**/*.css' }

export default [
  {
    input: 'src/index.js',
    output: [
      {
        sourcemap: true,
        format: 'iife',
        file: 'dist/index.min.js'
      },
      {
        sourcemap: true,
        format: 'es',
        file: 'dist/index.min.mjs'
      }
    ],
    plugins: [
      resolve(),
      string(stringOptions),
      coverage && istanbul(instanbulOptions),
      watch && serve(),
      watch && livereload('.'),
      !(watch || coverage) && terser(terserOptions)
    ],
    watch: { clearScreen: false }
  },
  {
    input: 'src/graph.js',
    output: [
      {
        sourcemap: true,
        format: 'iife',
        file: 'dist/graph.min.js'
      },
      {
        sourcemap: true,
        format: 'es',
        file: 'dist/graph.min.mjs'
      }
    ],
    plugins: [terser(terserOptions)]
  },
  {
    input: 'src/script-editor.js',
    output: [
      {
        sourcemap: true,
        format: 'iife',
        file: 'dist/script-editor.min.js'
      },
      {
        sourcemap: true,
        format: 'es',
        file: 'dist/script-editor.min.mjs'
      }
    ],
    plugins: [
      resolve(),
      string(stringOptions),
      terser(terserOptions)
    ]
  },
  {
    input: 'src/renderer.js',
    output: {
      sourcemap: true,
      format: 'es',
      file: 'dist/renderer.min.js'
    },
    plugins: [
      resolve(),
      coverage && istanbul(instanbulOptions),
      !(watch || coverage) && terser(terserOptions)
    ]
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
