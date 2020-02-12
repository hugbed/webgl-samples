import commonjs from 'rollup-plugin-commonjs';
import glslify from 'rollup-plugin-glslify';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: [
    {
      file: 'dist/bundle.js',
      format: 'cjs'
    }
  ],
  plugins: [
    glslify(),
    resolve(),
    commonjs()
  ]
};
