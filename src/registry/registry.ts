import { init, inject, provide, scope, ScopeEnum } from 'injection';
import * as vscode from 'vscode';
import { commandRegisterFactory } from "../command";
import { Instance } from '../instance';
import { logger } from '../logger';
import { addBracket, commandQuickpick, createProject, insertDeclaration, openScriptProject, rerunLastCommand, showAllCommands, surroundWith, visualModeYank } from './handler';

class BuiltInCommands {
    private builtInCommands= {
        openProject: openScriptProject, 
        createProject, 
        rerunLastCommand,
    };

    private customCommands = {
        insertDeclaration,  
        addBracket,  
        surroundWith,  
        visualModeYank,  
        commandQuickpick, 
    };

    private commands = {
        ...this.builtInCommands,
        ...this.customCommands    
    };

    public get commandTable() {
        const table = Object.entries(this.commands).map(([id, handler]) => {
            return { commandId: `${this.prefix}.${id}`, handler };
        }).reduce((table, { commandId, handler }) => {
           table[commandId] = handler;
            return table;
        }, {});
        const showAllCommandsId = `${this.prefix}.showAllCommands`;
        return {
            ...table,
            [showAllCommandsId]: showAllCommands(table),
        };
    }
    constructor(private prefix: string) { }
}

interface CommandTable {
    [key: string]: (...args: any) => any;
};

@provide()
@scope(ScopeEnum.Singleton)
export class CommandRegistry {

    @inject(Instance.ExtensionContext)
    private context: vscode.ExtensionContext;
    
    private table: CommandTable = {};

    public lastExecutedCommand: { command: string; args: any } | undefined = undefined;

    private get prefix(): string  {
        return vscode.workspace.getConfiguration('vsce-script').get('commandPrefix') || 'vsce-script';
    }

    @init()
    public async init() {
        this.table = new BuiltInCommands(this.prefix).commandTable;
        Object.entries(this.table).forEach(([cmd, fn]) => {
            logger.info(`registerCommand: ${cmd}`);
            return this.registerCommand(cmd, fn);
        });
        await Promise.resolve();
    }

    public registerCommand(commandId: string, handler: (...args: any) => any) {
        const [registerCommand] = commandRegisterFactory(this.context);
        this.table[commandId] = async (...args: any[]) => {
           this.lastExecutedCommand = { command: commandId, args: args?.[0] };
           return await handler(...args);
        };
        registerCommand(commandId, handler);
    }
}