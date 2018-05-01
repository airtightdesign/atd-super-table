 var path = require('path');
 var webpack = require('webpack');
 var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
 var ExtractTextPlugin = require('extract-text-webpack-plugin');
 const autoprefixer = require('autoprefixer');
 const extractSass = new ExtractTextPlugin({
    filename: '../css/main.min.css',
    allChunks: true
});
 
 module.exports = {
     entry: ['./js/AtdSuperTable.js', './sass/atd-super-table.scss'],
     output: {
         path: path.resolve(__dirname, '../dist/js'),
         filename: 'atd-super-table.min.js'
     },
    plugins: [
        extractSass,
        new UglifyJsPlugin({
            sourceMap: true
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            options: {
                postcss: [
                    autoprefixer(),
                ]
            }
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
                loader: extractSass.extract(['css-loader', 'postcss-loader' ,'sass-loader'])
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