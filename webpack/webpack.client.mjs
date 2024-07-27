import path from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import CompressionPlugin from "compression-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { EsbuildPlugin } from "esbuild-loader";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import logger from "../src/utils/logger.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDevelopment = process.env.NODE_ENV !== "production";

import dotenv from "dotenv";
dotenv.config();

const config = {
  mode: isDevelopment ? "development" : "production",
  target: "web",
  entry: "./src/client/client.tsx",
  output: {
    path: path.resolve(__dirname, "../build/client"),
    filename: "[name].[contenthash].js",
    clean: true,
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs"],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      // Procesamiento de archivos TypeScript y JavaScript
      {
        test: /\.(ts|tsx|js|jsx)$/,
        use: [
          {
            loader: "esbuild-loader",
            options: {
              loader: "tsx",
              target: "es2015",
              sourcemap: isDevelopment,
            },
          },
        ],
        exclude: /node_modules/,
      },
      // Manejo de imágenes
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        use: [
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 75,
              },
            },
          },
        ],
        type: "asset",
      },
      // Manejo de fuentes
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
      // Procesamiento de archivos CSS
      {
        test: /\.css$/,
        use: [
          isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
        ],
      },
      // Procesamiento de archivos SCSS
      {
        test: /\.scss$/,
        use: [
          isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
  devServer: {
    allowedHosts: "all",
    bonjour: false,
    client: {
      overlay: {
        warnings: true,
        errors: true,
      },
      progress: true,
    },
    compress: true,
    devMiddleware: {
      writeToDisk: true,
    },
    headers: {
      "X-Custom-Header": "yes",
    },
    historyApiFallback: true,
    host: "0.0.0.0",
    hot: true,
    liveReload: true,
    onListening: (devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }
      const port = devServer.server.address().port;
      logger.info(`Listening on port: ${port}`);
    },
    open: false,
    port: 9000,
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    ],
    setupExitSignals: true,
    setupMiddlewares: (middlewares) => {
      logger.info("Configurando middlewares personalizados...");
      return middlewares;
    },
    static: {
      directory: path.join(__dirname, "../build/client"),
      watch: true,
    },
    watchFiles: ["src/**/*.*"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/assets/template/index.html",
      favicon: "src/assets/icons/favicon.ico",
      inject: "body",
      minify: !isDevelopment
        ? {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          }
        : false,
      scriptLoading: "defer",
      hash: true,
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        isDevelopment ? "development" : "production",
      ),
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css",
    }),
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminMinify,
        options: {
          plugins: [
            ["mozjpeg", { quality: 75 }],
            ["optipng", { optimizationLevel: 5 }],
          ],
        },
      },
    }),
    new CompressionPlugin({
      algorithm: "gzip",
      filename: "[path][base].gz",
      test: /.*/,
      threshold: 10240,
      minRatio: 0.8,
      exclude: /node_modules/,
    }),
  ],
  devtool: isDevelopment ? "source-map" : "hidden-source-map",
  // Configuración de optimización
  optimization: {
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
            )[1];
            return `npm.${packageName.replace("@", "")}`;
          },
        },
      },
    },
    runtimeChunk: "single",
    minimize: !isDevelopment,
    minimizer: [
      new EsbuildPlugin({
        target: "es2015",
        css: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },

  // Configuración de caché
  cache: {
    type: "filesystem",
    version: `${process.env.NODE_ENV}_${Date.now()}`,
    cacheDirectory: path.resolve(__dirname, ".webpack_client_cache"),
    buildDependencies: {
      config: [__filename],
    },
  },
  // Configuración de rendimiento
  performance: {
    hints: isDevelopment ? false : "warning",
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  //==>
};

export default config;
