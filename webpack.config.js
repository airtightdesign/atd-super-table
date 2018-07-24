 var path = require('path');
 var webpack = require('webpack');
 var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
 var ExtractTextPlugin = require('extract-text-webpack-plugin');
 const extractSass = new ExtractTextPlugin({
    filename: '../css/atd-super-table.css',
    allChunks: true
});
 
 module.exports = {
     entry: ['./src/js/AtdSuperTable.js'],
     output: {
         path: path.resolve(__dirname, './dist/js'),
         filename: 'atd-super-table.js'
     },
    plugins: [
        new UglifyJsPlugin({
            sourceMap: true
        }),
        extractSass,
        new webpack.LoaderOptionsPlugin({
            minimize: false
        })
    ],
     module: {
         rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            { 
                test: /\.(sass|scss)$/,
                loader: extractSass.extract(['css-loader', 'sass-loader'])
            }
        ]
     },
     stats: {
         colors: true
     },
     devtool: 'source-map',
     resolveLoader: {
        modules: [
            path.join(__dirname, 'node_modules')
        ]
    },
     resolve: {
        modules: [
            path.join(__dirname, 'node_modules')
        ]
    }
 };
