import * as vsc from 'vscode';

// Entire module 'vscode' which contains the VS Code extensibility API
const { window } = vscode;
// Vsce-Script extension library
const { command: { registerCommand }} = lib;

export function activate(context: vsc.ExtensionContext) {
    window.showInformationMessage(`activate vsce-script: ${context.extension.packageJSON.version}`);
    registerCommand('vsce-script.hello world', () => {
        window.showInformationMessage('Hello Vsce-Script');
    });
}

/**
 * @param {import('vscode').ExtensionContext} context
 */
export function deactivate() { }
