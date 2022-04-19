import { init, inject, provide, scope, ScopeEnum } from 'injection';
import * as vscode from 'vscode';
import { commandRegisterFactory } from "../command";
import { Instance } from '../instance';
import { logger } from '../logger';
import { CommandTable } from './table';

@provide()
@scope(ScopeEnum.Singleton)
export class CommandRegistry {

    @inject(Instance.ExtensionContext)
    private context: vscode.ExtensionContext;

    private table = new CommandTable(this.prefix);

    public lastExecutedCommand: { command: string; args: any } | undefined = undefined;

    private get prefix(): string {
        return vscode.workspace.getConfiguration('vsce-script').get('commandPrefix') || 'vsce-script';
    }

    @init()
    public async init() {
        Object.entries(this.table.internal).forEach(([cmd, fn]) => {
            logger.info(`Register Built-In Command: ${cmd}`);
            return this.registerCommand(cmd, fn);
        });
        await Promise.resolve();
    }

    public registerCommand(commandId: string, handler: (...args: any) => any) {
        const [registerCommand] = commandRegisterFactory(this.context);
        const commandHandler = async (...args: any[]) => {
            this.lastExecutedCommand = { command: commandId, args: args?.[0] };
            return await handler(...args);
        };
        registerCommand(commandId, commandHandler);
    }
}