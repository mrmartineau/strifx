import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    react: 'src/react.ts',
    template: 'src/template.ts',
  },
  format: ['cjs', 'esm'],
  minify: true,
  treeshake: true,
})
