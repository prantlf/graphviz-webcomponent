import resolve from '@rollup/plugin-node-resolve'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import { spawn } from 'child_process'

const watch = process.env.ROLLUP_WATCH

export default [
  {
    input: 'js/index.js',
    output: {
      sourcemap: true,
      format: 'iife',
      file: 'js/index.min.js'
    },
    plugins: [
      resolve(),
      watch && serve(),
      watch && livereload('.'),
      !watch && terser({ output: { comments: false } })
    ],
    watch: { clearScreen: false }
  },
  {
    input: 'css/index.css',
    output: { file: 'css/index.min.css' },
    plugins: [
      postcss({
        extract: true,
        minimize: !watch,
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
