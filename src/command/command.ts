import * as vscode from 'vscode';
import * as cp from 'child_process';
import { logger } from '../logger';

export function commandRegisterFactory(context: vscode.ExtensionContext) {
	const registerCommand = (commandId: string, commandHandler: (...args: any[]) => any) => {
		const subscription = vscode.commands.registerCommand(commandId, commandHandler);
		logger.debug(`registerCommand:${commandId}`);
		context.subscriptions.push(subscription);
	};
	const registerTextEditorCommand = (commandId: string, commandHandler: (...args: any[]) => any) => {
		const subscription = vscode.commands.registerCommand(commandId, commandHandler);
		logger.debug(`registerTextEditorCommand:${commandId}`);
		context.subscriptions.push(subscription);
	};
	return [registerCommand, registerTextEditorCommand];
}

export function execCmd<T = unknown>(cmd: string | { command: string; args: object }): () => Thenable<T> {
	if (typeof cmd === 'string') {
		return () => vscode.commands.executeCommand(cmd);
	} else if (cmd.command && typeof cmd.command === 'string') {
		return () => vscode.commands.executeCommand(cmd.command, cmd.args);
	} else {
		const msg = `Provide wrong command payload: ${cmd}`;
		vscode.window.showErrorMessage(msg);
		throw new Error(msg);
	}
}

export function insertSnippet(snippet: string) {
	return () => execCmd({
		command: "insertSnippet",
		args: { snippet }
	});
}

export function execShell(cmd: string) {
	return new Promise((resolve, reject) => {
		cp.exec(cmd, (err, stdout, stderr) => {
			if (err) {
				console.error(stderr);
				reject(err);
			}
			resolve(stdout);
		});
	});
}
