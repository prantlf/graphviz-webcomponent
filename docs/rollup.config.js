import resolve from '@rollup/plugin-node-resolve'
import livereload from 'rollup-plugin-livereload'
import postcss from 'rollup-plugin-postcss'
import { minify } from 'rollup-plugin-swc-minify'
import { spawn } from 'child_process'

const { NODE_ENV, ROLLUP_WATCH: watch } = process.env
const prod = NODE_ENV === 'production'

export default [
  {
    input: 'js/page.js',
    output: {
      sourcemap: true,
      format: 'iife',
      file: 'js/page.min.js'
    },
    plugins: [
      resolve(),
      watch && serve(),
      watch && livereload('.'),
      !watch && prod && minify({ output: { comments: false } })
    ],
    watch: { clearScreen: false }
  },
  {
    input: 'css/page.css',
    output: { file: 'css/page.min.css' },
    plugins: [
      postcss({
        extract: true,
        minimize: !watch && prod,
        sourceMap: true
      })
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
