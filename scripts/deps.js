
const tsDeps = ['typescript', 'ts-loader', 'ts-node'];

const webpack = ['webpack', 'webpack-cli'];

const webpackLoader = [
    'file-loader',
    'url-loader',
    'html-loader',
    'null-loader',
    'style-loader',
    'imports-loader',
    'url-loader',
    'svg-url-loader',
    'css-loader'
];

const webpackPlugin = [
    'copy-webpack-plugin',
    'add-asset-html-webpack-plugin',
    'circular-dependency-plugin',
    'compression-webpack-plugin',
    'offline-plugin',
    'terser-webpack-plugin'
];

const jest = ['jest', 'ts-jest'];

const reactCommonPackages = [
    'react-redux@7.0.2',
    'redux@4.0.1',
    'react-router-dom@5.0.0',
    'redux-saga@1.0.2',
    'style-components@4.2.0',
    'immer@9.0.6'
];

const babel = ['@babel/core', 'babel-loader', '@babel/preset-env'];

const babelProdDeps = ['@babel/polyfill'];

const babelPlugins = [
    '@babel/runtime',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-react-constant-elements',
    '@babel/plugin-transform-react-inline-elements',
    '@babel/preset-react',
    '@babel/register',
];

export const devDeps = {
    tsDeps,
    webpack,
    webpackLoader,
    webpackPlugin,
    jest,
    reactCommonPackages,
    babel,
    babelDevDeps,
    babelPlugins,
};

export const deps = {
    babelProdDeps
};