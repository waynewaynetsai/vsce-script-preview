// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commandRegisterFactory, execCmd, invokeCommands, runMacro, type, typeCommands } from './command';

function getCursorPosition() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;
	return editor.selection.active;
}

function setCursorPosition(pos: vscode.Position): () => Promise<any>{
	return () => new Promise((resolve, _reject) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;
		setTimeout(() => {
			const endPos = new vscode.Position(pos.line, pos.character-1);
			const selection = new vscode.Selection(endPos, endPos);
			editor.selection = selection;
			resolve(null);
		}, 0);
	});
}

function getCurrentLine(editor: vscode.TextEditor): string {
	return editor.document.lineAt(editor.selection.active.line).text;
}

function switchToInsertModeSelection(): Promise<void> {
	return new Promise((resolve, _reject) => {
		const editor = vscode.window.activeTextEditor;
		const prevSel = editor?.selections;
		if (!prevSel) return;
		const enterInsertMode = typeCommands(["<Esc>", "i"]);
		invokeCommands(enterInsertMode);
		setTimeout(() => {
			editor.selection = new vscode.Selection(0, 0, 0, 0);
			editor.selections = prevSel.map((sel: vscode.Selection) => new vscode.Selection(
				sel.start.line,
				sel.start.character,
				sel.end.line,
				sel.end.character
			))
			resolve();
		}, 0);
	});
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vsce-script" is now active!');

	const [registerCommand, registerTextEditorCommand] = commandRegisterFactory(context);

	registerCommand("vsce-script.cmd", () => {
		vscode.window.showInformationMessage("script commands");
		runMacro(["<Esc>", "i", " ", "{", "}", "<left>", "\n"]);
	});

	registerTextEditorCommand('vsce-script.addBracket', (editor) => {
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
		vscode.window.showInformationMessage(str);
	});

	registerCommand("vsce-script.surroundWith", () => {
		invokeCommands([
			switchToInsertModeSelection,
			execCmd("surround.with")
		]);
		// invokeCommands([
		// 	...enterInsertMode,
		// ]);
		// // await vscode.commands.executeCommand('type', { text: 'x'});
		// await vscode.commands.executeCommand('extension.vim_escape');
		// await vscode.commands.executeCommand('extension.vim_insert');

		// 	console.log('args', arg);
		// 	if (arg?.commands) {
		// 		invokeCommands(arg);
		// 	}
		// }, 0);
	});

	registerCommand("vsce-script.visualModeYank", async () => {
		const pos = getCursorPosition();
		if (!pos) return; 
		invokeCommands([
			type("y"),
			setCursorPosition(pos),
		]);
		// await ;
		// editor.selection.active = cursorPos;
	});
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vsce-script.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vsce-script!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
