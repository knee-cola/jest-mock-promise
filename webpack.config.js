const path = require('path');

const srcDir = './lib';
const destDir = './dist';

module.exports = {
    entry: {
        "jest-mock-promise": `${srcDir}/jest-mock-promise.ts`,
    },
    mode: "production",
    output: {
        path: path.resolve(`${__dirname}/${destDir}`),
        filename: '[name].js',
        library: 'jest-mock-promise',
        libraryTarget: 'umd'
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    devtool: 'source-map',

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/
            },
        ]
    },
    // in order to work on browser and node we need to set `globalObject` to `this`
    // https://stackoverflow.com/questions/64639839/typescript-webpack-library-generates-referenceerror-self-is-not-defined
    globalObject: 'this',
};