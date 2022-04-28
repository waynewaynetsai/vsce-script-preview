import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ExtensionContext } from 'vscode';
import { WorkspaceConfig } from './config';
import { init, inject, provide, scope, ScopeEnum } from 'injection';
import { Library } from './library';
import { Instance } from './instance';
import { LibraryApi } from './typings/library';

const vscodeApi: typeof vscode = require('vscode');

declare const __webpack_require__: any;
declare const __non_webpack_require__: any;

interface VsceScriptModule {
    vscode: typeof vscode;
    activate(context: ExtensionContext, ...args: any[]): void;
    deactivate(): void;
}

@provide()
@scope(ScopeEnum.Singleton)
export class ScriptLoader implements vscode.Disposable {

    @inject(Instance.Library)
    private lib: Library;

    @inject(Instance.ExtensionContext)
    private context: vscode.ExtensionContext;

    public cacheScript!: VsceScriptModule;

    @init()
    public async init() {
        await this.injectGlobalDependencies(this.context);
        this.load();
        this.context.subscriptions.push(this);
        return Promise.resolve();
    }

    public async injectGlobalDependencies(context: vscode.ExtensionContext) {
        global.vscode = vscodeApi;
        global.lib = await this.lib.getLatestLib();
    }

    private require(scriptPath: string) {
        const requireModule = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
        delete requireModule.cache[requireModule.resolve(scriptPath)];
        this.cacheScript = requireModule(scriptPath);
        return this.cacheScript;
    }

    public load() {
        try {
            console.log('lib', this.lib);
            const configPath = vscode.workspace.getConfiguration().get<string>(WorkspaceConfig.ProjectPath)!;
            if (configPath === '') {
                vscode.window.showErrorMessage(`Should create a project path for vsce-script!`);
                return;
            }
            const projectPath = path.normalize(path.relative(__dirname, configPath));
            const isTsProject = fs.existsSync(path.join(projectPath, 'tsconfig.json'));
            if (isTsProject) {
                const hasExtensionJs = fs.existsSync(path.join(projectPath, 'extension.js'));
                if (!hasExtensionJs) {
                    vscode.window.showErrorMessage(`Should compile and output extension.js file for ts project!`);
                    return;
                }
            }
            console.log('Debug script', this.context);
            console.log('project', projectPath);

            const script = this.require(projectPath);
            script.activate(this.context);
        } catch (error) {
            vscode.window.showErrorMessage('Error: ' + error);
            console.error('ScriptLoader:error', error);
            vscode.window.showErrorMessage(JSON.stringify(error));
        }
    }

    public dispose() {
        this.cacheScript?.deactivate();
    }
}