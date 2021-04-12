const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const baseConfig = require('./webpack.common.js');

module.exports = merge(baseConfig, {
	mode: 'production',
	entry: {
		vendor: ['react', 'react-dom', 'lodash'],
		app: ['@babel/polyfill', path.resolve(__dirname, 'src/index.tsx')],
	},
	output: {
		// entry에 존재하는 app.js, vendor.js로 뽑혀 나온다.
		path: path.resolve(__dirname, 'docs'),
		filename: 'js/[name].[chunkhash:16].js',
		chunkFilename: 'js/[id].[chunkhash:16].js',
		publicPath: './',
	},
	optimization: {
		minimizer: [
			// we specify a custom UglifyJsPlugin here to get source maps in production
			new TerserPlugin({
				cache: true,
				parallel: true,
				terserOptions: {
					warnings: false,
					compress: {
						warnings: false,
						unused: true, // tree shaking(export된 모듈 중 사용하지 않는 모듈은 포함하지않음)
					},
					ecma: 5,
					mangle: true,
					unused: true,
				},
				sourceMap: true,
			}),
		],
	},
	devServer: {
		inline: true,
		port: process.env.PORT,
		contentBase: path.resolve(__dirname, 'public'),
		hot: false,
		publicPath: '/',
		historyApiFallback: true,
		proxy: {
			'/api': {
				target: 'http://localhost',
			},
			'/api/ws': {
				target: 'ws://localhost',
				ws: true,
			},
		},
		headers: {
			'X-Frame-Options': 'sameorigin', // used iframe
		},
	},
	plugins: [
		// 로더들에게 옵션을 넣어주는 플러그인
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
		// index.html 로 의존성 파일들 inject해주는 플러그인
		new WorkboxPlugin.GenerateSW({
			swDest: 'sw.js',
		}),
	],
});
