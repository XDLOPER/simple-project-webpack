import webpack from 'webpack'
import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebPackPlugin from 'html-webpack-plugin'
import {CleanWebpackPlugin} from 'clean-webpack-plugin'
// import CopyWebpackPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv'
import fs from 'fs'

import webFileFindEngine,{changeExtensions} from '../utils/helpers/web-file-find.js';
import {fileExistController} from '../utils/helpers/fileExistController.js';

// CONSTANTS
import {__WEB_FILE_PATH__,__SOURCE__,__ENV_PATH__,__WEB_PLUGIN_TEMPLATE__,__WEB_PLUGIN_TEMPLATE_DATA__,__WEB_PLUGIN_FAVICON__} from '../utils/constants/index.js' 
let templateEngineData = null;

// environment variables setup 

if(__ENV_PATH__[0]){
  dotenv.config({path:__ENV_PATH__[0]});
}

////////////////////////////////////////////////////////////////////////

if(__WEB_PLUGIN_TEMPLATE_DATA__ === false){
  console.log('template data json not found!')
}else{
  
  try {
    
    templateEngineData = fs.readFileSync(__WEB_PLUGIN_TEMPLATE_DATA__, 'utf8');
  
  } catch (err) {
    console.error('template data json not read! code: ', err);
  }
  
}


const HtmlWebPackPluginArray = []

const webFilePathController =  __WEB_FILE_PATH__ ? __WEB_FILE_PATH__ : __WEB_PLUGIN_TEMPLATE__

webFileFindEngine(webFilePathController).forEach((webFilePath)=>{

  const result = fileExistController(path.resolve(webFilePathController!, webFilePath), false);
  const fallbackPath: string = result ? path.resolve(webFilePathController!, webFilePath) : __WEB_PLUGIN_TEMPLATE__
  const htmlWebPackPlugin = new HtmlWebPackPlugin({
    inject: 'body',
    title: process.env.X_NAME,
    favicon:webFilePath.includes('index') === true ?  __WEB_PLUGIN_FAVICON__ ? __WEB_PLUGIN_FAVICON__ : null : null,
    template:fallbackPath, //fileExistController(path.resolve(__WEB_FILE_PATH__,webFilePath),false) ? path.resolve(__WEB_FILE_PATH__,webFilePath) : path.resolve('index.html'), // burda type uyuşmazlığı var diyor çözemedim sonra bakılacak
    templateParameters:templateEngineData,
    filename: path.join(changeExtensions(webFilePath)),
    excludeChunks:webFilePath.includes('index') === true ? [] : ['main'],
    hash: true,
    minify: false,
  })

  HtmlWebPackPluginArray.push(htmlWebPackPlugin)
})


export const pluginConfig: webpack.Configuration['plugins'] = [

  // for before file delete 
  new CleanWebpackPlugin(),

  /* for copy the file - 
  new CopyWebpackPlugin({
    patterns: [
      { from: path.resolve(__SOURCE__,'public/icons'), to: "icons" }
    ],
    options: {
      concurrency: 100,
    },
  }), */

  // for css file extract
  new MiniCssExtractPlugin({
    filename: 'style/main.[contenthash].css',
  }),

  // for webpack global varibles 
  __ENV_PATH__[0] ? new webpack.DefinePlugin({
    'process.env': JSON.stringify(process.env),
  }) : false,

  // for webpack import alias
  new webpack.ProvidePlugin({
    'x':'myPackage', // optional
    $:'jquery',
  }),
  
  ...HtmlWebPackPluginArray
];