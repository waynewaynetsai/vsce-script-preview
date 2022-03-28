import * as vscode from 'vscode';
import { commandRegisterFactory } from "../command";
import { addBracket, commandQuickpick, createProject, insertDeclaration, openScriptProject, showAllCommands, surroundWith, visualModeYank } from './handler';

class BuiltInCommands {
    private handlers = {
        openProject: openScriptProject, 
        createProject, 
        insertDeclaration,  
        addBracket,  
        surroundWith,  
        visualModeYank,  
        commandQuickpick, 
    };
    public get commandTable() {
        return Object.entries(this.handlers).map(([id, handler]) => {
            return { commandId: `${this.prefix}.${id}`, handler };
        }).reduce((table, { commandId, handler }) => {
           table[commandId] = handler;
            return table;
        }, {});
    }
    constructor(private prefix: string) { }
}

interface CommandTable {
    [key: string]: (...args: any) => any;
};

export class CommandRegistry {
    private table: CommandTable = {};
    public lastExecutedCommand = '';

    private get prefix(): string  {
        return vscode.workspace.getConfiguration('vsce-script').get('commandPrefix') || 'vsce-script';
    }

    constructor(private context: vscode.ExtensionContext) { 
        this.init();
    }

    public registerCommand(commandId: string, handler: (...args: any) => any) {
        const [registerCommand] = commandRegisterFactory(this.context);
        this.table[commandId] = async () => {
           this.lastExecutedCommand = commandId;
           return await handler();
        };
        registerCommand(commandId, handler);
    }

    private init() {
        const [registerCommand] = commandRegisterFactory(this.context);
        this.table = this.createCommandTable();
        Object.entries(this.table).forEach(([cmd, fn]) => {
            console.log('registerCommand', cmd);
            return registerCommand(cmd, fn);
        });
    }

    private createCommandTable(): CommandTable {
        const table = new BuiltInCommands(this.prefix).commandTable;
        return {
            ...table,
            showAllCommands: showAllCommands(table),
        };
    }
}