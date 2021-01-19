//Configuration file for webpack

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = [{
	mode: 'production',
	entry: [
		path.resolve(__dirname, './src/assets/main.js')
	],
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, './dist/')
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
							implementation: require('sass'),
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