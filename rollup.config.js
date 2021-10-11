import pkg from './package.json'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      compact: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      compact: true
    }
  ],
  external: Object.keys(pkg.dependencies || {}),
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      rootDir: 'src',
      exclude: ['tests/**/*']
    })
  ]
}
