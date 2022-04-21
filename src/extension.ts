import 'reflect-metadata';

import * as vscode from 'vscode';
import { Library } from './library';
import { Instantiator } from './instantiator';
import { registerReloadCommand, registerWorkspaceChangeEvent } from './registry';

export async function activate(context: vscode.ExtensionContext) {
	try {
		await Instantiator.startup(context);
		const library = await Instantiator.container.getAsync<Library>(Library);
		registerWorkspaceChangeEvent(context);
		registerReloadCommand(context);
		return library.getLatestLib(context);
	} catch (error) {
		const msg = 'Unexpected Vsce-Script Error';
		console.error(msg, error);
		vscode.window.showErrorMessage(`${msg}: ${JSON.stringify(error)}`);
	}
}

export function deactivate() { }
