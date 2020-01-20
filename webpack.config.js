const path = require('path')

module.exports = {
    mode: "development",
    entry: "./src/app.js",
    output: {
        filename: "ggj.js",
        path: path.resolve(__dirname, 'public')
    },
    devServer: {
        contentBase: './public'
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /src\/.+\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [ '@babel/preset-env' ]
                    }
                }
            }
        ]
    }
};

