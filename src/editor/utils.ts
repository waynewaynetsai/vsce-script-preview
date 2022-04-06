import * as vsc from 'vscode';
import { Position } from "vscode";
import * as path from 'path';
import { spawnShell } from '../command';
import { logger } from '../logger';

function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

export function getCurrentLine(editor: vsc.TextEditor): string {
	return editor.document.lineAt(editor.selection.active.line).text;
}

export function getLine(lineNumber: number) {
    const editor = vsc.window.activeTextEditor;
    if (!editor) return;
    return editor.document.lineAt(lineNumber).text;
}

export function getCursorPosition(): vsc.Position | undefined {
	const editor = vsc.window.activeTextEditor;
	if (!editor) return;
	return editor.selection.active;
}

export function getFirstCharOnLine(
    document: vsc.TextDocument,
    line: number
): Position {
    const lineNum = clamp(line, 0, document.lineCount - 1);
    return new Position(lineNum, document.lineAt(lineNum).firstNonWhitespaceCharacterIndex);
}

export function getCharAt(document: vsc.TextDocument, position: Position): string {
    const pos = document.validatePosition(position);
    return document.lineAt(pos).text[pos.character];
}

export function getCharUnderCursor() {
    const activeTextEditor = vsc.window.activeTextEditor;
    if (!activeTextEditor) return;
    const doc = activeTextEditor?.document;
    return getCharAt(doc, activeTextEditor.selection.active);
}

export function getSelectedText() {
    const editor = vsc.window.activeTextEditor;
    if (!editor) return;
    const selection = editor.selection;
    return editor.document.getText(selection);
}

export function createNewFile(filename: string, content: string, fsPath?: string) {
    const filePath = vsc.window.activeTextEditor?.document.uri.fsPath;
    if (!filePath || !fsPath) return;
    const dirPath = fsPath ? path.dirname(fsPath) : path.dirname(filePath);
    const newFileUri = vsc.Uri.file(path.join(dirPath, filename));
    return vsc.workspace.fs.writeFile(newFileUri, Uint8Array.from(content, x => x.charCodeAt(0)));
}

export function createNewFolder(name: string, fsPath?: string) {
    const folderPath = vsc.window.activeTextEditor?.document.uri.fsPath;
    if (!folderPath || !fsPath) return;
    const dirPath = path.dirname(folderPath);
    const newFileUri = vsc.Uri.file(path.join(dirPath, name));
    return vsc.workspace.fs.createDirectory(newFileUri);
}


export function openProject(fsPath: string, option?: {
    newWindow?: boolean;
    goTo?: { fsPath: string; line: number; character: number }
}) {
    let args: string[] = [];
    if (option?.goTo) {
        const goTo = option.goTo;
        args = args.concat([`-g`, `${goTo.fsPath}:${goTo.line}:${goTo.character}`]);
    }
    if (option?.newWindow) {
        args = args.concat([fsPath]);
    } else {
        args = args.concat([`-a`, fsPath]);
    }
    logger.debug(`Open Project: ${fsPath}`);
    return spawnShell('code', args);
}

export function copyProjectTemplate(source: string, target: string, option: { overwrite: boolean } = { overwrite: false }) {
    return vsc.workspace.fs.copy(vsc.Uri.file(source), vsc.Uri.file(target), option);
}
