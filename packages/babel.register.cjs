const { URL } = require("node:url");
const { resolve } = require("node:path");

const register = require("@babel/register");

register({
	extensions: [".ts", ".tsx"],
	configFile: resolve(__dirname, "babel.esm.config.json"),
});
