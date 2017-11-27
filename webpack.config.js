const path = require('path');

const srcDir = './src/';
const destDir = 'dist';

module.exports = {
    entry: {
        "jest-mock-promise": srcDir+"jest-mock-promise.ts",
    },
    output: {
        path: path.resolve(__dirname + '/' + destDir),
        filename: '[name].js',
//        library: 'JestMockPromise',
//        libraryTarget: 'umd'
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.ts$/,
                loader: "awesome-typescript-loader",
                exclude: /node_modules/,
                options: {
                    useBabel: true
                }
            },
        ]
    }
};