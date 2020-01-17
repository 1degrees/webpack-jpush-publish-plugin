<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![cover][cover]][cover-url]
[![chat][chat]][chat-url]
[![size][size]][size-url]

# webpack-jpush-publish-plugin

将编译完成的前端文件放置发布项目中

## Getting Started

开始, 你需要安装 `webpack-jpush-publish-plugin`:

```console
$ npm install webpack-jpush-publish-plugin --save-dev
```

然后添加 `webpack` 配置. 如下:

**webpack.config.js**

```js
const jpushPublish = require('webpack-jpush-publish-plugin');

module.exports = {
  plugins: [
    new jpushPublish({
        gitLab: 'https://gitlab.jpushoa.com/titan/titan-front/titan-rbac-front-publish.git',
        env: 'test',                        //分支名称
        version: (new Date).getTime(),      //打包版本
        dir: 'publish/www/',                //移动复制打包文件至XXX
        filter: /^.*$/                      //需要移动复制的文件
    }),
  ],
};
```

> ℹ️ `webpack-jpush-publish-plugin` 插件主要用于极光前端代码打包后复制搬运到发布项目目录.

## Options

The plugin's signature:

**webpack.config.js**

```js
module.exports = {
  plugins: [new CopyPlugin(patterns, options)],
};
```

### Patterns

|               Name                |        Type         |                     Default                     | Description                                                                                           |
| :-------------------------------: | :-----------------: | :---------------------------------------------: | :---------------------------------------------------------------------------------------------------- |
|          [`gitLab`](#gitLab)      |     `{String}`      |  `undefined`                                    | 发布部署项目的仓库地址                                                                                 |
|            [`env`](#env)          |     `{String}`      |            `compiler.options.output`            | 发布环境-对应发布项目分支.                                                                              |
|       [`version`](#context)       |     `{String}`      | `options.context \|\| compiler.options.context` | 打包版本                                                                                              |
|        [`dir`](#totype)           |     `{String}`      |                   `undefined`                   | 发布项目存放编译文件目录XXX                                                                             |
|          [`filter`](#test)        |     `{RegExp}`      |                   `undefined`                   | 需要移动复制至发布项目里的文件                                                                          |

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/copy-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/copy-webpack-plugin
[node]: https://img.shields.io/node/v/copy-webpack-plugin.svg
[node-url]: https://nodejs.org
[deps]: https://david-dm.org/webpack-contrib/copy-webpack-plugin.svg
[deps-url]: https://david-dm.org/webpack-contrib/copy-webpack-plugin
[tests]: https://dev.azure.com/webpack-contrib/copy-webpack-plugin/_apis/build/status/webpack-contrib.copy-webpack-plugin?branchName=master
[tests-url]: https://dev.azure.com/webpack-contrib/copy-webpack-plugin/_build/latest?definitionId=5&branchName=master
[cover]: https://codecov.io/gh/webpack-contrib/copy-webpack-plugin/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/copy-webpack-plugin
[chat]: https://img.shields.io/badge/gitter-webpack%2Fwebpack-brightgreen.svg
[chat-url]: https://gitter.im/webpack/webpack
[size]: https://packagephobia.now.sh/badge?p=copy-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p=copy-webpack-plugin