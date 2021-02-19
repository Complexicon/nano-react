const webpack = require('webpack');
const path = require('path');
const args = process.argv.slice(2);

var config = {
	entry: './App.js',
	output: {
		path: path.join(__dirname, '/bundle'),
		filename: 'bundle.js'
	},
	devtool: (args[0] === 'prod' ? undefined : 'eval-cheap-module-source-map'),
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM'
	},
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					"style-loader",
					// Translates CSS into CommonJS
					"css-loader",
					// Compiles Sass to CSS
					"sass-loader",
				],
			},
			{
				test: /\.js?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: { presets: ['@babel/preset-env', '@babel/preset-react'] }
			}
		]
	}
}

const compiler = webpack(config);

if (args[0] === 'prod') compiler.run(WebpackFormatter);
else {
	const fs = require('fs');
	require('http').createServer(function (request, response) {
		console.log('request: ' + request.url);

		var filePath = '.' + request.url;
		if (filePath == './')
			filePath = './index.html';

		var extname = path.extname(filePath);
		var contentType = 'text/html';
		switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
			case '.json':
				contentType = 'application/json';
				break;
			case '.png':
				contentType = 'image/png';
				break;
			case '.jpg':
				contentType = 'image/jpg';
				break;
			case '.wav':
				contentType = 'audio/wav';
				break;
		}

		fs.readFile('./bundle/' + filePath, function (error, content) {
			if (error) {
				if (error.code == 'ENOENT') {
					response.writeHead(404);
					response.end('not found');
				} else {
					response.writeHead(500);
					response.end('error: ' + error.code);
				}
			}
			else {
				response.writeHead(200, { 'Content-Type': contentType });
				response.end(content, 'utf-8');
			}
		});

	}).listen(3000, () => {
		console.log('running dev server at 3000');
		require('child_process').exec((process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open') + ' http://localhost:3000');
	});
	compiler.watch({ aggregateTimeout: 200, ignored: '**/node_modules', poll: 1000 }, WebpackFormatter)
}

function WebpackFormatter(err, stats) {
	console.log(stats.toString())
}