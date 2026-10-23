const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const { VueLoaderPlugin } = require('vue-loader');

const root = __dirname;

const removeVueStyleDefaultImports = () => ({
  visitor: {
    ImportDeclaration(importPath) {
      const source = importPath.node.source.value;
      const isVueStyle = /[?&]vue&type=style(?:&|$)/.test(source);
      const isCssModule = /[?&]module(?:[=&]|$)/.test(source);

      if (isVueStyle && !isCssModule) {
        importPath.node.specifiers = [];
      }
    }
  }
});

const scriptConfig = {
  name: 'scripts',
  entry: './src/js/headmaster.js',
  output: {
    path: path.resolve(root, 'deploy/js'),
    filename: 'ramhorn.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue'],
    modules: [path.resolve(root, 'src/js'), 'node_modules']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.vue$/,
        resourceQuery: { not: [/vue&type=/] },
        enforce: 'post',
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            plugins: [removeVueStyleDefaultImports]
          }
        }
      },
      {
        test: /\.js$/,
        include: path.resolve(root, 'src/js'),
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { defaultExport: true }
          },
          {
            loader: 'css-loader',
            options: { url: false }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { defaultExport: true }
          },
          {
            loader: 'css-loader',
            options: { url: false }
          },
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({ filename: '../css/components.css' })
  ],
  optimization: {
    minimize: true,
    minimizer: ['...', new CssMinimizerPlugin()]
  },
  stats: 'errors-warnings'
};

const styleConfig = {
  name: 'styles',
  entry: {
    cassette: './src/sass/cassette.scss',
    dependencies: [
      './node_modules/bootstrap/dist/css/bootstrap.css',
      './node_modules/jquery-ui/dist/themes/smoothness/jquery-ui.css'
    ]
  },
  output: {
    path: path.resolve(root, 'deploy/css'),
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { url: false }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { url: false }
          },
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({ filename: '[name].css' })
  ],
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()]
  },
  devtool: 'source-map',
  stats: 'errors-warnings'
};

module.exports = [scriptConfig, styleConfig];
