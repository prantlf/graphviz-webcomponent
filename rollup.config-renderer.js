import resolve from '@rollup/plugin-node-resolve'
import { minify } from 'rollup-plugin-swc-minify'

export default {
  input: 'src/renderer.js',
  output: {
    sourcemap: true,
    file: 'dist/renderer.min.js'
  },
  plugins: [
    resolve(),
    process.env.NODE_ENV === 'production' && minify()
  ]
}
