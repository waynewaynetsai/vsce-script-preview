import { inject, provide } from 'injection';
import * as vscode from 'vscode';
import * as packageJSON from '../package.json';
import { commandRegisterFactory, completionRegisterFactory, execCmd, execShell, invokeCommands, runMacro, type } from './command';
import { createNewFile, createNewFolder, getCharAt, getCharUnderCursor, getCursorPosition, getFirstCharOnLine, getSelectedText, setCursorPosition, switchToInsertModeSelection } from './editor';
import { Instance } from './instance';
import { CommandRegistry } from './registry/registry';

@provide()
export class Library {

    @inject(Instance.ExtensionContext)
    public context: vscode.ExtensionContext;

    @inject(Instance.CommandRegistry)
    private registry: CommandRegistry;

    public version: string = packageJSON.version;

    getLatestLib(context: vscode.ExtensionContext) {
        const registerCompletionProvider = completionRegisterFactory(context);
        const lib = {
            vim: {
                switchToInsertModeSelection,
                runMacro,
                type
            },
            command: {
                registerCommand: (commandId: string, handler: (...args) => any) => this.registry.registerCommand(commandId, handler),
                invokeCommands,
                execShell,
                execCmd
            },
            editor: {
                registerCompletionProvider,
                getFirstCharOnLine,
                getCharAt,
                getSelectedText,
                getCharUnderCursor,
                createNewFile,
                createNewFolder,
                getCursorPosition,
                setCursorPosition
            }
        };
        return lib;
    }
}