import * as vscode from 'vscode';
import { typeCommands, invokeCommands } from "../command";

export function getCurrentLine(editor: vscode.TextEditor): string {
	return editor.document.lineAt(editor.selection.active.line).text;
}

export function getCursorPosition(): vscode.Position | undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor)
		return;
	return editor.selection.active;
}

export function setCursorPosition(pos: vscode.Position): () => Promise<any> {
	return () => new Promise((resolve, _reject) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor)
			return;
		setTimeout(() => {
			const endPos = new vscode.Position(pos.line, pos.character - 1);
			const selection = new vscode.Selection(endPos, endPos);
			editor.selection = selection;
			resolve(null);
		}, 0);
	});
}

export function switchToInsertModeSelection(): Promise<void> {
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
