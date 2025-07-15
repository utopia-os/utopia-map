import path from 'path'
import { fileURLToPath } from 'url'

import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'
import postcss from 'rollup-plugin-postcss'
import svg from 'rollup-plugin-svg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const aliasConfig = alias({
  entries: [{ find: '#types', replacement: path.resolve(__dirname, 'src/types') }],
})

export default [
  {
    input: {
      index: 'src/index.tsx',
      Profile: 'src/Components/Profile/index.tsx',
    },
    output: [
      {
        dir: 'dist/',
        format: 'esm',
        sourcemap: true,
        entryFileNames: '[name].esm.js',
      },
      {
        dir: 'dist/',
        format: 'cjs',
        sourcemap: true,
        entryFileNames: '[name].cjs.js',
      },
    ],
    plugins: [
      aliasConfig,
      resolve({
        extensions: ['.ts', '.tsx'],
      }),
      commonjs({
        include: [
          /node_modules\/attr-accept/,
          /node_modules\/tiptap-markdown/,
          /node_modules\/markdown-it-task-lists/,
          /node_modules\/classnames/,
          /node_modules\/react-qr-code/,
        ],
        requireReturnsDefault: 'auto',
      }),
      postcss({
        plugins: [],
      }),
      typescript({
        tsconfig: './tsconfig.json',
        noEmitOnError: true,
      }),
      svg({ base64: true }),
    ],
    external: [
      'react',
      'react-dom',
      'react-markdown',
      'react/jsx-runtime',
      'remark-breaks',
      'leaflet',
      'react-leaflet',
      'react-toastify',
      'react-string-replace',
      'react-toastify/dist/ReactToastify.css',
      'react-router-dom',
      'react-leaflet-cluster',
      '@tanstack/react-query',
      'prop-types',
      'leaflet/dist/leaflet.css',
      '@heroicons/react/20/solid',
      '@heroicons/react/24/outline/ChevronRightIcon',
      '@heroicons/react/24/outline',
      'date-fns',
      '@heroicons/react/24/outline/InformationCircleIcon',
      '@heroicons/react/24/outline/QuestionMarkCircleIcon',
      '@heroicons/react/24/outline/ChevronDownIcon',
      'axios',
      'react-image-crop',
      'react-image-crop/dist/ReactCrop.css',
      'react-colorful',
      'leaflet.locatecontrol/dist/L.Control.Locate.css',
      'yet-another-react-lightbox',
      'react-photo-album',
      'react-inlinesvg',
    ],
  },
  {
    input: {
      index: path.resolve(__dirname, 'dist/types/src/index.d.ts'),
      Profile: path.resolve(__dirname, 'dist/types/src/Components/Profile/index.d.ts'),
    },
    output: {
      dir: path.resolve(__dirname, 'dist'),
      format: 'es',
      entryFileNames: '[name].d.ts',
    },
    plugins: [
      aliasConfig,
      dts({
        compilerOptions: {
          skipLibCheck: true,
        },
      }),
    ],
    external: [/\.css$/],
    watch: false,
  },
]
