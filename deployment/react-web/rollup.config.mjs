import { nodeResolve } from "file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules/@rollup/plugin-node-resolve/dist/cjs/index.js";
import commonjs from "file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules/@rollup/plugin-commonjs/dist/cjs/index.js";
import { babel } from "file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules/@rollup/plugin-babel/dist/cjs/index.js";
import clear from "file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules/rollup-plugin-clear/dist/index.js";
import esbuild from "file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules/rollup-plugin-esbuild/dist/index.mjs";
import postcss from "file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules/rollup-plugin-postcss/dist/index.js";
import nodePolyfills from "file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules/rollup-plugin-polyfill-node/dist/index.js";

import mendixCopy from "file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/rollup-plugin-mendix-copy.mjs";
import mendixResolve from "file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/rollup-plugin-mendix-resolve.mjs";
import mendixRemoveUnchangedFilesFromBundle from"file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/rollup-plugin-mendix-remove-unchanged-files-from-bundle.mjs";
import generatePrecacheServiceWorker from "file://C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/generate-precache-serviceworker.mjs";

const JAVASCRIPT_SOURCE_PATH_REGEX = /javascriptsource/;
const PLUGGABLE_WIDGETS_PATH_FILTER = "./widgets/**";

const isProduction = process.env.NODE_ENV === "production";
const shouldGenerateSourceMaps = process.env.SOURCE_MAP_GENERATION === "enabled";

export default {
    input: "index.js",
    watch: {
        clearScreen: false,
    },
    output: {
        dir: "dist",
        format: "es",
        chunkFileNames: "[name].js",
        sourcemap: shouldGenerateSourceMaps,
        minifyInternalExports: isProduction,
        manualChunks(id) {
            if (id.includes("node_modules")) {
                return "commons";
            }
        },
    },
    treeshake: isProduction,
    plugins: [
        mendixResolve(
            "C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/web-resolutions.json",
            "C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules",
            "C:/Users/lenovo/Desktop/Scrumption/deployment/web/cachetag.txt"
        ),
        nodePolyfills(),
        esbuild({
            sourceMap: shouldGenerateSourceMaps,
            exclude: [JAVASCRIPT_SOURCE_PATH_REGEX, PLUGGABLE_WIDGETS_PATH_FILTER],
            minify: isProduction,
            target: "ES2020",
            define: {
                "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
            },
            loaders: {
                // Enable JSX in .js files too
                ".js": "jsx",
            },
        }),
        ignore(/react-native/),
        nodeResolve({
            modulePaths: ["C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules"],
        }),
        commonjs({ transformMixedEsModules: true, exclude: [/mendix-web/, PLUGGABLE_WIDGETS_PATH_FILTER] }),
        babel({
            babelHelpers: "bundled",
            include: JAVASCRIPT_SOURCE_PATH_REGEX,
            presets: [
                [
                    "C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules/@babel/preset-env",
                    { targets: { safari: "13" } },
                ],
            ],
            plugins: [
                "C:/Users/lenovo/AppData/Local/Programs/Mendix/10.12.2.41995/modeler/tools/node/node_modules/@babel/plugin-syntax-dynamic-import"
            ],
        }),
        clear({
            targets: ["dist"],
        }),
        postcss({
            extract: "widgets.css",
            minimize: isProduction,
            sourcemap: shouldGenerateSourceMaps ? "inline": false
        }),
        generatePrecacheServiceWorker({
            deploymentDir: "C:/Users/lenovo/Desktop/Scrumption/deployment",
        }),
        mendixCopy({
            targetFolder: "dist",
            sources: [
                {
                    folder: "C:/Users/lenovo/Desktop/Scrumption/deployment/web/widgets",
                    exclude: [".js", ".mjs", ".css"],
                    include: "**",
                },
            ],
        }),
        mendixRemoveUnchangedFilesFromBundle()
    ],
};

function ignore(regex) {
    const emptyFile = "export default {}";
    const emptyFileName = "\0rollup_plugin_ignore_empty_module_placeholder";

    return {
        name: "ignore",
        resolveId(importee) {
            return importee === emptyFileName || regex.test(importee) ? emptyFileName : null;
        },
        load(id) {
            return id === emptyFileName ? emptyFile : null;
        },
    };
}
