import * as vscode from 'vscode';
import { commandRegisterFactory, execCmd, invokeCommands, runMacro, type } from './command';
import { getCurrentLine, getCursorPosition, setCursorPosition, switchToInsertModeSelection } from './editor';
import { logger } from './logger';

class MockGit {

	private head = 0;

	private branchs = ['11.1-master'];
	public get currentBranch() {
		return this.branchs[this.head];
	}
	public checkout(branchName: string) {
		this.head = this.branchs.findIndex(n => n === branchName);
		return this.currentBranch;
	}

	public branch(newBranch?: string) {
		if (newBranch) {
			this.branchs.push(newBranch);
		}
		return this.branchs;
	}
}

export function activate(context: vscode.ExtensionContext) {

	logger.info('Active vsce-script extension!');

	const [registerCommand, registerTextEditorCommand] = commandRegisterFactory(context);

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
		invokeCommands([
			type("y"),
			setCursorPosition(pos),
		]);
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
		vscode.commands.executeCommand(selected.command!, selected.args!);
	});

}

export function deactivate() { }

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
	const [registerCommand, registerTextEditorCommand] = commandRegisterFactory(context);

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

function demo(context: vscode.ExtensionContext) {

	const [registerCommand, registerTextEditorCommand] = commandRegisterFactory(context);

	const updateCommandId = '11.1-userinput-api.updateItem';

	const git = new MockGit();

	let item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10000);
	item.text = git.currentBranch;
	item.command = updateCommandId;
	item.show();

	const dropdown = async (dropdownItems: string[]) => await vscode.window.showQuickPick(dropdownItems, {
		canPickMany: false,
		placeHolder: `Select your git action`,
	});

	const input = async (placeHolder: string) => await vscode.window.showInputBox({
		placeHolder
	}) || '';

	registerCommand(updateCommandId, async () => {
		const answer = await dropdown(['Create new branch', ...git.branch()]) || '';

		if (answer === 'Create new branch') {

			const newBranchName = await input('New Branch Name');

			git.branch(newBranchName);

			item.text = git.checkout(newBranchName);

			vscode.window.showInformationMessage(`Create new branch ${newBranchName}`);

		} else if (answer !== '') {
			item.text = git.checkout(answer);
			vscode.window.showInformationMessage(`Checkout to branch ${git.currentBranch}`);
		}
	});

	context.subscriptions.push(item);

	registerCommand('workspace-api.getSettings', async () => {
		const workspaceSettings = vscode.workspace.getConfiguration('practice-workspace');
		console.log(workspaceSettings);
	});

}