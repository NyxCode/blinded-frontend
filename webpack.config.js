const webpack = require('webpack');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const Properties = require("./properties.json");

module.exports = {
    entry: {
        index: "./src/js/index.js",
        game: "./src/js/game.js",
        result: "./src/js/result.js",
        play: "./src/js/play.js",
        multiplayer: "./src/js/multiplayer.js",
        "join-game": "./src/js/join-game.js"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.sass$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|gif|mp3|html)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name(file) {
                                let dontUseHash = file.endsWith(".html") || file === "heart.png";
                                return dontUseHash ? "[name].[ext]" : "[hash].[ext]";
                            }
                        }
                    }
                ]
            },
            {
                exclude: [/node_modules/, /dist/, /.git/],
                test: /\.(html|css|js)$/,
                use: [{
                    loader: StringReplacePlugin.replace({
                        replacements: [
                            {
                                pattern: /{{? ([\w.]+)? }}/ig,
                                replacement: function (match, key) {
                                    let value = eval(`Properties.${key}`);
                                    if (value == null) {
                                        throw `Property "${key}" does not resolve to any value!`
                                    }
                                    console.log(`Replacing variable "${key}" with "${value}"...`);
                                    return value;
                                }
                            }
                        ]
                    })
                }]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({$: 'jquery', jQuery: 'jquery'}),
        new StringReplacePlugin()
    ]
};