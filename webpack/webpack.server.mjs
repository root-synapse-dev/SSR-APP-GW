import path from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CompressionPlugin from "compression-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { EsbuildPlugin } from "esbuild-loader";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDevelopment = process.env.NODE_ENV !== "production";

import dotenv from "dotenv";
dotenv.config();

const config = {
  mode: isDevelopment ? "development" : "production",
  target: "node",
  entry: "./src/server/server.tsx",
  output: {
    path: path.resolve(__dirname, "../build/server"),
    filename: "server.bundle.js",
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
              target: "node14",
              sourcemap: isDevelopment,
            },
          },
        ],
        exclude: /node_modules/,
      },
      // Manejo de archivos estáticos (no van en el build del servidor)
      {
        test: /\.(png|jpe?g|gif|svg|webp|woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          emit: false,
        },
      },
      // Ignoramos los archivos CSS en el build del servidor
      {
        test: /\.(css|scss)$/,
        use: [{ loader: "null-loader" }],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        isDevelopment ? "development" : "production",
      ),
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
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
    minimize: !isDevelopment,
    minimizer: [
      // Usamos esbuild para minificar
      new EsbuildPlugin({
        target: "node14",
      }),
    ],
  },
  // Desactivamos advertencias de rendimiento
  performance: {
    hints: isDevelopment ? false : "warning",
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  // Configuración de caché para builds más rápidos
  cache: {
    type: "filesystem",
    version: `${process.env.NODE_ENV}_${Date.now()}`,
    cacheDirectory: path.resolve(__dirname, ".webpack_server_cache"),
    store: "pack",
    buildDependencies: {
      config: [__filename],
    },
  },

  // Configuración de estadísticas de compilación
  stats: {
    colors: true,
    reasons: isDevelopment,
  },

  // Configuración de logging
  infrastructureLogging: {
    level: "info",
    colors: true,
  },
  //==>
  externals: [nodeExternals()],
};

export default config;
