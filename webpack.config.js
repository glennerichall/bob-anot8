const path = require('path');
const webpack = require('webpack');
var S3Plugin = require('webpack-s3-plugin');
var version = require('./package.json').version;

module.exports = env => {
  let plugins = [
    // add the plugin to your plugins array
    new webpack.DefinePlugin({
      'process.env.target': `'${env.target}'`,
      'process.env.version': `'${version}'`
    })
  ];
  console.log('version: ' + version);
  console.log('environment: ' + env.target);

  if (env.target == 'prod') {
    plugins.push(
      new S3Plugin({
        // Only upload css and js
        include: /.*\.(css|js)/,
        // s3Options are required
        s3Options: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        },
        s3UploadOptions: {
          Bucket: 'velor'
        }
      })
    );
  }

  return {
    entry: './src/index.js',
    output: {
      filename: env.target == 'dev' ? 'annotator.js' : 'annotator.min.js',
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
    plugins,
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
