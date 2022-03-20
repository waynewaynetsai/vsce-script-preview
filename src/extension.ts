import * as vscode from 'vscode';
import * as packageJson from '../package.json';
import * as path from 'path';
import * as fs from 'fs';
import { commandRegisterFactory, execCmd, execShell, invokeCommands, runMacro, type, typeKeys } from './command';
import { copyProjectTemplate, getCurrentLine, getCursorPosition, getFirstCharOnLine, getSelectedText, openProject, setCursorPosition, switchToInsertModeSelection } from './editor';
import { confirm, dropdown, input } from './interactive';
import { ScriptLoader } from './loader';
import { logger } from './logger';
import { Library } from './library';

const reloadEmitter = new vscode.EventEmitter();

export function activate(context: vscode.ExtensionContext) {
	try {
		const lib = new Library(context).getLatestLib(context);
		const userScript = ScriptLoader.instantiate(context, lib);
		context.subscriptions.push(
			vscode.workspace.onDidChangeConfiguration((e) => {
				const configId = 'vsce-script.scriptPath';
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
		console.error('catched', error);
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

	const [registerCommand, registerTextEditorCommand] = commandRegisterFactory(context);

	registerCommand('vsce-script.createScriptProject', async () => {
		vscode.window.showInformationMessage('Create Project!');
		// STEP0: if there is defined project or given path, check whether override original project path config or not?
		// STEP1: ask typescript or javascript
		const projectType: string | undefined = await dropdown('Create Typescript or Javascript script project?', [
			'javascript',
			'typescript'
		], 'typescript');
		if (!projectType) return;
		// STEP2: select folder
		const projectUris = await vscode.window.showOpenDialog({
			title: 'Select a folder to create extension project',
			openLabel: 'Create Project',
			canSelectFolders: true,
			canSelectFiles: false
		});
		if (!projectUris) return;
		if (!projectUris?.[0]) return;
		const projectName = await input('Input your project name', 'vsce-script-project');
		if (projectName) return;
		const projectPath = path.join(projectUris?.[0].fsPath, projectName);
		console.log(projectUris);
		const isProjectExist = fs.existsSync(projectPath);
		if (isProjectExist) {
			const reuseProject = await confirm('Project is exist, Open this project?');
			if (reuseProject) {
				await invokeCommands([ openProject(projectPath) ]);	
				return;
			}
		}
		// STEP3: generate project template/copy file or folder
		try {
			const projectTemplatePath = path.resolve(__dirname, `../template/${projectType}`);
			await copyProjectTemplate(projectTemplatePath, projectPath, { overwrite: false });
		} catch (err) {
			logger.error(`Fail to create script project: ${JSON.stringify(err)}`);
			vscode.window.showErrorMessage(`Fail to create script project: ${JSON.stringify(err)}`);
		}
		const useNpm = await dropdown('Use yarn or npm ?', ['yarn', 'npm'], 'npm') === 'npm';
		invokeCommands([
			// STEP4: install project deps
			useNpm ? execShell(`npm`, ['install'], { cwd: projectPath }) : execShell(`yarn`, [], { cwd: projectPath }),
			// STEP5: open project folder
			openProject(projectPath, { newWindow: true })
		]);
});

registerCommand('vsce-script.openProject', () => {
	const projectPath = vscode.workspace.getConfiguration('vsce-script.projectPath');

});

registerCommand('vsce-script.showAllCommands', () => {

});

registerCommand('vsce-script.insertDeclaration', (args) => {
	const activeTextEditor = vscode.window.activeTextEditor;
	if (!activeTextEditor) return;
	try {
		const { inserting, replacing, type } = args;
		activeTextEditor.edit(editBuilder => {
			const replacingStart = new vscode.Position(replacing.start.line, replacing.start.character);
			const replacingEnd = new vscode.Position(replacing.end.line, replacing.end.character + type.length + 1);
			editBuilder.replace(new vscode.Range(replacingStart, replacingEnd), ';');
		}).then(_ => {
			activeTextEditor.insertSnippet(
				new vscode.SnippetString(type + " ${1:newLocal} = "),
				new vscode.Position(inserting.line, inserting.character)
			);
		});
	} catch (error) {
		console.error(error);
	}
});

registerCommand("vsce-script.testCmd", () => {
	vscode.window.showInformationMessage("script commands");
});

registerTextEditorCommand('vsce-script.addBracket', (editor: vscode.TextEditor) => {
	const str = getCurrentLine(editor);
	const lastChar = str.charAt(str.length - 1);
	const hasWhitespace = lastChar === " ";
	const hasClosedParen = lastChar === ')';
	const hasOpenedParen = str.includes('(');
	if (hasWhitespace) {
		runMacro(["{", "}", "<left>", "\n"]);
	} else if (!hasClosedParen && hasOpenedParen) {
		runMacro([")", " ", "{", "}", "<left>", "\n"]);
	} else {
		runMacro([" ", "{", "}", "<left>", "\n"]);
	}
});

registerCommand("vsce-script.surroundWith", () => {
	invokeCommands([
		switchToInsertModeSelection,
		execCmd("surround.with")
	]);
});

registerCommand("vsce-script.visualModeYank", () => {
	const pos = getCursorPosition();
	if (!pos) return;
	runMacro(['<Esc>', 'm', 'y', 'y', '`', 'y']);
});

registerCommand("vsce-script.command-quickpick", async (setting: QuickpickSetting) => {
	const items: QuickpickCommandItem[] = setting.items.map(originalSetting => ({
		...originalSetting,
		description: `$(gear)command:${originalSetting.command}`,
	}));
	const selected = await vscode.window.showQuickPick(items, {
		title: setting.title,
		matchOnDescription: true
	});
	if (!selected) return;
	await vscode.commands.executeCommand(selected.command!, selected.args!);
});

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

interface QuickpickSetting {
	title: string;
	default?: string;
	items: QuickpickCommandItem[]
}

interface QuickpickCommandItem extends vscode.QuickPickItem {
	label: string;
	command: string;
	args?: any;
}


function runMacroDemo(context: vscode.ExtensionContext) {
	const [registerCommand] = commandRegisterFactory(context);

	const searchWord = (word: string) => ["/", `${word}`, "\n"];
	const goTop = ["g", "g"];
	const deleteCurrentLine = ["d", "d"];

	const removeComponent = (tagName: string) => [
		"<Esc>",
		...goTop,
		...searchWord(tagName),
		...deleteCurrentLine,
		...searchWord(tagName),
		...deleteCurrentLine
	];

	registerCommand("vsce-script.runMacro", async (name: string) => {
		switch (name) {
			case 'RemoveChildComponent':
				const tagName = await vscode.window.showInputBox({
					title: 'Delete component import and html tag',
					placeHolder: 'enter your full component tag name'
				});
				if (tagName) {
					const dynamicMacro = removeComponent(tagName);
					runMacro(dynamicMacro);
				}
				break;
			default:
				break;
		}
	});
}