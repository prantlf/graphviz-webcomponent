import resolve from '@rollup/plugin-node-resolve'
import livereload from 'rollup-plugin-livereload'
import { minify } from 'rollup-plugin-swc-minify'
import { string } from 'rollup-plugin-string'
import { spawn } from 'child_process'

const watch = process.env.ROLLUP_WATCH
const dev = process.env.NODE_ENV === 'development'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        sourcemap: true,
        format: 'iife',
        name: 'graphvizElements',
        file: 'dist/index.min.js'
      },
      {
        sourcemap: true,
        file: 'dist/index.min.mjs'
      }
    ],
    plugins: [
      resolve(),
      string({ include: '**/*.css' }),
      watch && serve(),
      watch && livereload('.'),
      !(watch || dev) && minify()
    ],
    watch: { clearScreen: false }
  },
  {
    input: 'src/graph.js',
    output: [
      {
        sourcemap: true,
        format: 'iife',
        name: 'graphvizElements',
        file: 'dist/graph.min.js'
      },
      {
        sourcemap: true,
        format: 'es',
        file: 'dist/graph.min.mjs'
      }
    ],
    plugins: [
      !(watch || dev) && minify()
    ]
  },
  {
    input: 'src/script-editor.js',
    output: [
      {
        sourcemap: true,
        format: 'iife',
        name: 'graphvizElements',
        file: 'dist/script-editor.min.js'
      },
      {
        sourcemap: true,
        file: 'dist/script-editor.min.mjs'
      }
    ],
    plugins: [
      resolve(),
      string({ include: '**/*.css' }),
      !(watch || dev) && minify()
    ]
  },
  {
    input: 'src/renderer.js',
    output: {
      sourcemap: true,
      file: 'dist/renderer.min.js'
    },
    plugins: [
      resolve(),
      !(watch || dev) && minify()
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
