const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');
const spreadPlugin = require('@babel/plugin-proposal-object-rest-spread');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const glob = require('glob');

const extractPlugin = new ExtractTextPlugin({
    publicPath: './dist/',
    filename: './[name].css',
    allChunks: true,
});

class CollectHtmlFiles {
    constructor(path) {
        this.path = path;
    }
    build() {
        return this.getPluginArray(this.getFiles());
    }
    getPluginArray(files) {
        return files.map(file => {
            return new HtmlWebpackPlugin({
                inject: 'head',
                title: path.parse(file).name,
                meta: {viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'},
                template: file,
                filename: path.basename(file),
            })
        });
    }
    getFiles() {
        return glob.sync(this.path + '/*.html');
    }
}

module.exports = {
    mode: 'development',
    entry: {
        'app': './src/js/app.js',
        'app-rtl': './src/styles/app-rtl.scss',
        'app-ltr': './src/styles/app-ltr.scss',
    },
    output: {
        path: `${__dirname}/dist`,
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: extractPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true,
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                minimize: true,
                                sourceMap: true,
                            },
                        },
                    ],
                }),
            },
            {
                test: /\.js$/,
                enforce: "pre",
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'eslint-loader',
                    },
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: [spreadPlugin],
                            sourceMap: true,
                        },
                    },

                ],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        'scss': 'vue-style-loader!css-loader!sass-loader',
                        'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
                    }
                }
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]',
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true,
                        },
                    },
                ],
            },
            {
                test: /\.(woff2?|ttf|otf|eot|svg)$/,
                exclude: /node_modules/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[ext]',
                },
            },
        ],
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        modules: ['node_modules', 'spritesmith-generated', 'bower_components'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    plugins: [
        new CleanWebpackPlugin('./dist'),
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, 'src/images/sprites/icons'),
                glob: '**/sp-*.png',
            },
            target: {
                image: path.resolve(__dirname, 'src/images/generated/sprites.png'),
                css: path.resolve(__dirname, 'src/styles/utils/_sprites.scss'),
            },
            apiOptions: {
                cssImageRef: '../images/generated/sprites.png',
            },
            retina: '@2x',
        }),
        extractPlugin,
        ...new CollectHtmlFiles('./src/templates').build(),
        new WriteFilePlugin({
            test: /\.css$/,
        }),
    ],
};
