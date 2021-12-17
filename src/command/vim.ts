import * as vscode from "vscode";
import { CommandFactory, TypeCommand } from "../models";

export const makeTypeCommand = (input: string): TypeCommand => {
    return {
        command: "text",
        args: {
            text: input
        }
    };
};

export function invokeCommands(commands: CommandFactory[]) {
	return commands.reduce((acc, curr) => acc.then(_ => curr()), Promise.resolve(null) as Thenable<null>);
}

export function type(typeText: string): () => Thenable<void> {
	return () => vscode.commands.executeCommand("type", { text: typeText });
}

export function typeCommands(texts: string[]): (() => Thenable<void>)[] {
	return texts.map(t => type(t));
}

export const runMacro = (cmds: string[]) => invokeCommands(typeCommands(cmds));

