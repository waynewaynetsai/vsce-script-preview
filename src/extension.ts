import * as vscode from 'vscode';
import * as packageJson from '../package.json';
import { commandRegisterFactory, execCmd, execShell, invokeCommands, runMacro } from './command';
import { ScriptLoader } from './loader';
import { logger } from './logger';
import { Library } from './library';
import { CommandRegistry } from './registry';

const reloadEmitter = new vscode.EventEmitter();

export function activate(context: vscode.ExtensionContext) {
	try {
		const registry = new CommandRegistry(context);
		const lib = new Library(context, registry).getLatestLib(context);
		const userScript = ScriptLoader.instantiate(context, lib);
		context.subscriptions.push(
			vscode.workspace.onDidChangeConfiguration((e) => {
				const configId = 'vsce-script.projectPath';
				if (e.affectsConfiguration(configId)) {
					vscode.window.showInformationMessage(`change workspace configuration ${vscode.workspace.getConfiguration(configId)}`);
					userScript.load(context);
				}
			})
		);
		registerAllCommands(context);
		registerReloalCommand(context, userScript);
		reloadEmitter.event(_ => registerReloalCommand(context, userScript));
		return lib;
	} catch (error) {
		const msg = 'Unexpected Vsce-Script Error';
		console.error(msg, error);
		vscode.window.showErrorMessage(`${msg}: ${JSON.stringify(error)}`);
	}
}

function registerReloalCommand(context: vscode.ExtensionContext, scriptLoader: ScriptLoader) {
	const [registerCommand] = commandRegisterFactory(context);
	registerCommand('vsce-script.reloadScript', () => {
		context.subscriptions.forEach(d => d.dispose());
		scriptLoader.load(context);
		registerAllCommands(context);
		reloadEmitter.fire(null);
	});
}

export function deactivate() { }

function registerAllCommands(context: vscode.ExtensionContext) {

	const [ registerCommand ] = commandRegisterFactory(context);

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