import 'reflect-metadata';

import * as vscode from 'vscode';
import { Library } from './library/library';
import { Instantiator } from './instantiator';
import { registerReloadCommand, registerWorkspaceChangeEvent } from './registry';
import { logger } from './logger';

export async function activate(context: vscode.ExtensionContext) {
	try {
		await Instantiator.startup(context);
		const library = await Instantiator.container.getAsync<Library>(Library);
		registerWorkspaceChangeEvent(context);
		registerReloadCommand(context);
		return await library.getLatestLib();
	} catch (error: any) {
		const msg = 'Vsce-Script Unexpected Error';
		logger.error(`[${msg}] ${error.message}`);
		vscode.window.showErrorMessage(`${msg}: ${JSON.stringify(error)}`);
	}
}

export function deactivate() { }
