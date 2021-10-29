import babel from 'rollup-plugin-babel';
import image from '@rollup/plugin-image';
import {terser} from "rollup-plugin-terser";

export default {
    input: './src/index.js',
    output: {
        file: './dist/react-3d-earth.min.js',
        format: 'cjs',
        exports: "default",
    },
    plugins: [babel(), image(), terser()],
    external: ['react', 'three', 'signals']
}
