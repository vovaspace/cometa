import { resolve } from "node:path";

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { StatsWriterPlugin } from "webpack-stats-plugin";

export default ({ development }) => ({
	mode: development ? "development" : "production",
	entry: `./source/client.tsx`,

	output: {
		path: resolve("build", "client"),
		filename: `bundle.[contenthash].js`,
	},

	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx"],
	},

	devtool: development ? "inline-source-map" : false,

	optimization: {
		minimize: !development,
	},

	module: {
		rules: [
			{
				test: /\.ts(x?)$/,
				use: "babel-loader",
			},
		],
	},

	plugins: [new CleanWebpackPlugin(), new StatsWriterPlugin()],
});
