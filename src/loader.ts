import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ExtensionContext } from 'vscode';
import { WorkspaceConfig } from './config';

const vscodeApi: typeof vscode = require('vscode');

declare const __webpack_require__: any;
declare const __non_webpack_require__: any;

interface VsceScriptModule {
    vscode: typeof vscode;
    activate(context: ExtensionContext, ...args: any[]): void;
    deactivate(): void;
}

export class ScriptLoader implements vscode.Disposable {

    public cacheScript!: VsceScriptModule;

    private static _instance: ScriptLoader;

    static instantiate(context: vscode.ExtensionContext, lib) {
       const instance = new ScriptLoader(context);
       instance.injectGlobalDependencies(lib); 
       instance.load(context);
       context.subscriptions.push(instance);
       ScriptLoader._instance = instance; 
       return instance;
    }

    static getInstance(context: vscode.ExtensionContext, lib) {
       if (!ScriptLoader._instance) {
           ScriptLoader.instantiate(context, lib); 
       }
       return this._instance = ScriptLoader._instance; 
    }

    constructor(private context: ExtensionContext) {} 
    
    public injectGlobalDependencies(lib) {
        global.vscode = vscodeApi;
        global.lib = lib;
    }

    private require(scriptPath: string) {
        const requireModule = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
        delete requireModule.cache[requireModule.resolve(scriptPath)];
        this.cacheScript = requireModule(scriptPath);
        return this.cacheScript;
    }

    public load(_context: ExtensionContext) {
        try {
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