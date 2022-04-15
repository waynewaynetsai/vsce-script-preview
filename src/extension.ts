import 'reflect-metadata';

import * as vscode from 'vscode';
import * as packageJson from '../package.json';
import * as path from 'path';
import { commandRegisterFactory, execCmd, execShell, invokeCommands, spawnShell } from './command';
import { ScriptLoader } from './loader';
import { logger } from './logger';
import { Library } from './library';
import { Instantiator } from './instantiator';
import { isTsProject } from './registry';
import { confirm } from './interactive';


export async function activate(context: vscode.ExtensionContext) {
	try {
		await Instantiator.startup(context);
		const container = Instantiator.container;
		const library = await Instantiator.container.getAsync<Library>(Library);
		context.subscriptions.push(
			vscode.workspace.onDidChangeConfiguration(async (e) => {
				const configId = 'vsce-script.projectPath';
				if (e.affectsConfiguration(configId)) {
					vscode.window.showInformationMessage(`change workspace configuration ${vscode.workspace.getConfiguration(configId)}`);
					const userScript = await container.getAsync<ScriptLoader>(ScriptLoader);
					userScript.load();
				}
			})
		);
		registerAllCommands(context);
		registerReloalCommand(context);
		return library.getLatestLib(context);
	} catch (error) {
		const msg = 'Unexpected Vsce-Script Error';
		console.error(msg, error);
		vscode.window.showErrorMessage(`${msg}: ${JSON.stringify(error)}`);
	}
}

function registerReloalCommand(context: vscode.ExtensionContext) {
	const reloadEmitter = new vscode.EventEmitter();
	const [registerCommand] = commandRegisterFactory(context);
	registerCommand('vsce-script.reloadScript', async () => {
		const isTypescript = isTsProject();
		if (isTypescript) {
			const compileProject = await confirm('Compile Typescript Project ?');
			const existProjectPath = vscode.workspace.getConfiguration('vsce-script').get<string>('projectPath');
			if (compileProject) {
				await spawnShell('npm', ['run', 'compile'], { cwd: existProjectPath })();
			}
		}
		context.subscriptions.forEach(d => d.dispose());
		const userScript = await Instantiator.container.getAsync<ScriptLoader>(ScriptLoader);
		userScript.load();
		registerAllCommands(context);
		reloadEmitter.fire(null);
	});
	reloadEmitter.event(_ => registerReloalCommand(context));
}

export function deactivate() { }

function registerAllCommands(context: vscode.ExtensionContext) {

	const [registerCommand] = commandRegisterFactory(context);

	registerCommand("vsce-script.setupExtensionProject", async (args) => {
		const { extension_id, vsix_path, dir_path } = args;
		const cd = `cd ${dir_path};`;
		const vscePackage = ` yes | vsce package`;
		const uninstall_extension = `code --uninstall-extension ${extension_id}`;
		const install_latest_extension = `code --install-extension ${vsix_path}`;
		const reload_window = `workbench.action.reloadWindow`;
		await invokeCommands([
			execShell(`${cd}${vscePackage}`),
			execShell(uninstall_extension),
			execShell(install_latest_extension),
			execCmd(reload_window)
		]);
		logger.show();
	});

	registerCommand("vsce-script.setupVimProject", async () => {
		const cd = `cd $HOME/Desktop/coding/coreapp/vscode-extension/Vim;`;
		const vscePackage = ` yes | vsce package`;
		const uninstall_extension = `code --uninstall-extension vscodevim.vim-fork`;
		const install_latest_extension = `code --install-extension /Users/tsaiwayne/Desktop/coding/coreapp/vscode-extension/Vim/vim-fork-1.21.5.vsix`;
		const reload_window = `workbench.action.reloadWindow`;
		await invokeCommands([
			execShell(`${cd}${vscePackage}`),
			execShell(uninstall_extension),
			execShell(install_latest_extension),
			execCmd(reload_window)
		]);
		logger.show();
	});

	registerCommand("vsce-script.setupVsceScriptProject", async () => {
		const projectPath = `/Users/tsaiwayne/Desktop/code/vscode-extensions/vsce-script-preview`;
		const extensionId = `waynetsai.vsce-script`;

		const cd = `cd ${projectPath};`;
		const vscePackage = ` yes | vsce package`;
		const uninstall_extension = `code --uninstall-extension ${extensionId}`;
		const install_latest_extension = `code --install-extension ${projectPath}/vsce-script-${packageJson.version}.vsix`;
		const reload_window = `workbench.action.reloadWindow`;
		await invokeCommands([
			execShell(`${cd}${vscePackage}`),
			execShell(uninstall_extension),
			execShell(install_latest_extension),
			execCmd(reload_window)
		]);
		logger.show();
	});


}