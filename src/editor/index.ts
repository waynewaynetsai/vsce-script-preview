import * as vsc from 'vscode';

export * from './utils';

import { typeCommands, invokeCommands } from "../command";


export function switchToInsertModeSelection(): Promise<void> {
	return new Promise((resolve, _reject) => {
		const editor = vsc.window.activeTextEditor;
		const prevSel = editor?.selections;
		if (!prevSel) return;
		const enterInsertMode = typeCommands(["<Esc>", "i"]);
		invokeCommands(enterInsertMode);
		setTimeout(() => {
			editor.selection = new vsc.Selection(0, 0, 0, 0);
			editor.selections = prevSel.map((sel: vsc.Selection) => new vsc.Selection(
				sel.start.line,
				sel.start.character,
				sel.end.line,
				sel.end.character
			));
			resolve();
		}, 0);
	});
}

export function setCursorPosition(pos: vsc.Position): Promise<any> {
	return new Promise((resolve, _reject) => {
		const editor = vsc.window.activeTextEditor;
		if (!editor) return;
		setTimeout(() => {
			const endPos = new vsc.Position(pos.line, pos.character - 1);
			const selection = new vsc.Selection(endPos, endPos);
			editor.selection = selection;
			resolve(null);
		}, 0);
	});
}
