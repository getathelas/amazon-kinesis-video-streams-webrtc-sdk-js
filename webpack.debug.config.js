const path = require('path');
const { merge } = require('webpack-merge');

module.exports = merge(require('./webpack.config'), {
    mode: 'development',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'kvs-webrtc.min.js',
    },

    // Include sourcemaps
    devtool: 'inline-source-map',
});
