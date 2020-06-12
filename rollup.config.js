import livereload from 'rollup-plugin-livereload'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import { spawn } from 'child_process'

const watch = process.env.ROLLUP_WATCH
const coverage = process.env.NODE_ENV === 'development'

export default {
  input: 'src/index.js',
  output: {
    sourcemap: true,
    format: 'iife',
    file: 'dist/index.min.js'
  },
  plugins: [
    coverage && babel({
      babelHelpers: 'bundled',
      plugins: ['istanbul']
    }),
    watch && serve(),
    watch && livereload('.'),
    !(watch || coverage) && terser()
  ],
  watch: { clearScreen: false }
}

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
