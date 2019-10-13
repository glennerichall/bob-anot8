const path = require('path');
const webpack = require('webpack');

module.exports = env => {
  return {
    entry: './src/index.js',
    output: {
      filename: 'annotator.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: [
            'url-loader',
            {
              loader: 'image-webpack-loader',
              options: {
                bypassOnDebug: true, // webpack@1.x
                disable: true // webpack@2.x and newer
              }
            }
          ]
        }
      ]
    },
    plugins: [
      // add the plugin to your plugins array
      new webpack.DefinePlugin({ 'process.env.target': env.target })
    ],
    devtool: 'inline-source-map',
    devServer: {
      historyApiFallback: true,
      watchOptions: { aggregateTimeout: 300, poll: 1000 },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization'
      }
    }
  };
};
