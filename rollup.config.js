import resolve from '@rollup/plugin-node-resolve'
import livereload from 'rollup-plugin-livereload'
import { minify } from 'rollup-plugin-swc-minify'
import { string } from 'rollup-plugin-string'
import alias from '@rollup/plugin-alias'
import { spawn } from 'child_process'

const { NODE_ENV, ROLLUP_WATCH: watch } = process.env
const prod = NODE_ENV === 'production'

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
      !watch && prod && minify()
    ],
    watch: { clearScreen: false }
  },
  {
    input: 'src/index.js',
    output: [
      {
        sourcemap: true,
        format: 'iife',
        name: 'graphvizElements',
        file: 'dist/index-bundled.min.js'
      },
      {
        sourcemap: true,
        file: 'dist/index-bundled.min.mjs'
      }
    ],
    plugins: [
      alias({
        entries: [{ find: './separate-engine', replacement: './bundled-engine' }]
      }),
      resolve(),
      string({ include: ['**/*.css', '**/*.min.js'] }),
      !watch && prod && minify()
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
      !watch && prod && minify()
    ]
  },
  {
    input: 'src/graph.js',
    output: [
      {
        sourcemap: true,
        format: 'iife',
        name: 'graphvizElements',
        file: 'dist/graph-bundled.min.js'
      },
      {
        sourcemap: true,
        format: 'es',
        file: 'dist/graph-bundled.min.mjs'
      }
    ],
    plugins: [
      alias({
        entries: [{ find: './separate-engine', replacement: './bundled-engine' }]
      }),
      string({ include: '**/*.min.js' }),
      !watch && prod && minify()
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
      !watch && prod && minify()
    ]
  },
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
