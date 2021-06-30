const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: "source-map",
    entry: "./examples/template.js",
    output: {
        path: __dirname + "/examples",
        filename: "bootstrap-datetimepicker_bundle.js",
    },
    plugins: [new HtmlWebpackPlugin({
        title: "Date Time Picker Development",
        template: "./examples/template.html"
    })],
};
