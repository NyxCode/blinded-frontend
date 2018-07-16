const webpack = require('webpack');

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
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {
                test: /\.(png|svg|jpg|gif|mp3|html)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name(file) {
                                return file.endsWith(".html") ? "[name].[ext]" : "[hash].[ext]";
                            }
                        }
                    }

                ]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ]
};