//Configuration file for webpack

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = [{
	mode: 'production',
	context: path.resolve(__dirname, 'src/resources/'),
	entry: [
		'/main.js',
		'/main.scss'
	],
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, '././dist/')
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'main.css'
						}
					},
					{ loader: 'extract-loader' },
					{ loader: 'css-loader' },
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									require('autoprefixer')
								]
							}
						}
					},
					{
						loader: 'sass-loader',
						options: {
							// Prefer Dart Sass
							implementation: require('sass'),

							// See https://github.com/webpack-contrib/sass-loader/issues/804
							webpackImporter: false,
							sassOptions: {
								includePaths: ['./node_modules']
							}
						}
					}
				]
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env']
				}
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin()
	]
}];