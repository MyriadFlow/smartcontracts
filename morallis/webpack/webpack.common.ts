import webpack from 'webpack'
import path from 'path'
import dotenv from "dotenv"
dotenv.config({ path: './.env' })

const config: webpack.Configuration = {
  entry: './src/index.ts',
  mode: "development",
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  resolve: {
    fallback: {
      'crypto': false,
      'stream': false,
      'assert': false,
      'http': false,
      'https': false,
      'os': false,
      'url': false,
      'util': false
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env)
    })
  ]
};

export default config;