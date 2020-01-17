/*
 * @Author: zhangx
 * @Date: 2019-04-29 14:51:55
 * @Last Modified by: zhangx
 * @Last Modified time: 2019-07-31 14:59:12
 * @file: webpack插件-拷贝编译完成的HTML至发布项目中
 */
const fs = require('fs');
const path = require('path');
const colors = require('colors'); 
const mkdirs = require('jm-mkdirs');
const exec = require('child_process').exec;
class CopyAndPushPlugin {
    constructor(options) {
        this.options = Object.assign({},options);
    }

    apply(compiler) {
        let {
            filter = /^.*\.html$/,
            dir = 'publish',
            retry = 3,
            version,
            gitLab,
            env,
        } = this.options;
        
        /**
         * git切换分支,提交操作
         * @param {*} compilation webpacke编译类
         * @param {*} callback  插件任务完成后的回调
         */
        const publishProject = (compilation, callback) => {
            gitClone(compilation, callback);
        }
        
        /**
         * git切换分支,提交操作
         * @param {*} compilation webpacke编译类
         * @param {*} callback  插件任务完成后的回调
         */
        const gitClone = (compilation, callback) => {
            const publish = path.resolve(__dirname, '../publish')
            if(!fs.existsSync(publish)){
                exec('git clone ' + gitLab + ' publish', {
                    cwd: path.resolve(__dirname, '../')
                }, function (error, stdout, stderr) {
                    gitCommit(compilation, callback);
                })
            } else {
                gitCommit(compilation, callback);
            }
        }

        /**
         * git切换分支,提交操作
         * @param {*} compilation webpacke编译类
         * @param {*} callback  插件任务完成后的回调
         */
        const gitCommit = (compilation, callback) => {
            exec('git checkout ' + env + ' && git pull origin ' + env , {
                cwd: path.resolve(__dirname, '../publish')
            }, function (error, stdout, stderr) {
                if (error) {
                    console.log(colors.red.underline(error));
                    callback();
                    return
                } else {
                    console.log(colors.yellow.underline('当前分支:' + env));
                    //分支切换完成，移动复制打包代码
                    copyFiles(compilation, () => {
                        exec("git add . && git commit -a -m 'auto-" + env + "-git-" + version + "'", {
                                cwd: path.resolve(__dirname, '../publish')
                        }, function (error, stdout, stderr) {
                            if (error) {
                                console.log(colors.red.underline(error));
                                callback();
                                return
                            } else {
                                console.log(colors.green('commit成功'));
                                exec("git push origin " + env, {
                                    cwd: path.resolve(__dirname, '../publish')
                                }, function (error, stdout, stderr) {
                                    if (error) {
                                        console.log(colors.red.underline(error));
                                        callback();
                                        return
                                    } else {
                                        console.log(colors.green('push成功'));
                                        callback();
                                    }
                                })
                            }
                        })
                    }) 
                }
            })
        }

        /**
         * 拷贝文件到publish文件加
         * @param {*} compilation webpacke编译类
         * @param {*} callback  插件任务完成后的回调
         */
        const copyFiles = (compilation, callback) => {
            let assets = compilation.assets;
            let filesNames = Object.keys(assets);
            let _files = filesNames.filter(e => filter.test(e));
            let _failedFiles = [];
            let _retryCount = 0;
            
            // 删除文件函数
            const _delDir = (path) => {
                let files = [];
                if(fs.existsSync(path)){
                    files = fs.readdirSync(path);
                    files.forEach((file, index) => {
                        let curPath = path + "/" + file;
                        if(fs.statSync(curPath).isDirectory()){
                            _delDir(curPath); //递归删除文件夹
                        } else {
                            fs.unlinkSync(curPath); //删除文件
                        }
                    });
                    fs.rmdirSync(path);
                }
            }

            // 单个文件移动复制函数
            const _copyFile = (name) => {
                return new Promise((resolve, reject) => {
                    let names = name.split(/[\\\/]/);
                    names.pop();
                    mkdirs.sync(path.resolve(__dirname, '../' + dir + names.join('/')));
                    fs.writeFile(
                        path.resolve(__dirname, '../' + dir + name), 
                        assets[name]['source'](), 'utf8',
                        err => {
                            let fi = _failedFiles.indexOf(name);
                            if(err) {
                                console.log('\n', colors.red('----' + name + ':放置失败----'), '\n', err, '\n')
                                if(fi == -1){
                                    _failedFiles.push(name);
                                }
                                reject(err);
                            } else {
                                console.log('\n', colors.green('----' + name + ':成功放置Pulish----'), '\n')
                                if(fi != -1){
                                    _failedFiles.splice(fi,1); 
                                }
                                resolve()
                            }
                        }
                    )
                })
            }
            
            // 文件移动复制进程
            const _cpoyProcess = () => {
                return Promise.all(
                    _files.map(e => _copyFile(e)))
                        .then(rs => {
                        Promise.resolve(rs);
                    },
                    _finish
                )
            }

            // 文件复制失败重试 最多重试{retry}次数
            const _retryProcess = (err) => {
                ++_retryCount;
                if (err && _retryCount > retry) {
                    console.log('\n');
                    return Promise.reject(err);
                } else if(_failedFiles.length && _retryCount <= retry){
                    return Promise.all(_failedFiles.map(e => _copyFile(e)))
                            .then(rs => Promise.resolve(rs), _retryProcess);
                } else {
                    return Promise.resolve();
                }
            }

            // 复制完成
            const _finish = (err) => {
                if(err){
                    console.log('\n', colors.red.underline(err), '\n');
                } else {
                    console.log('\n', colors.green('所有HTML成功移入发布项目'), '\n');
                }
                callback(err);
              };

            // 清空文件夹
            _delDir(path.resolve(__dirname, '../' + dir.replace(/\/$/,'')));
            
            // 拷贝进程开始
            _cpoyProcess().then((rs) => {
                return _retryProcess();
            }, _retryProcess).then(() => {
                _finish() 
            }, _finish)
        }

        if (compiler.hooks) {   // For webpack >= 4
            compiler.hooks.afterEmit.tapAsync('gitOperate', publishProject);
        } else {                // For webpack < 4
            compiler.plugin('after-emit', publishProject);
        }
    }
}
module.exports = CopyAndPushPlugin;