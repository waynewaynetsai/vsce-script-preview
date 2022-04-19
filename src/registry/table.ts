import * as vscode from 'vscode';
import { addBracket, commandQuickpick, createProject, insertDeclaration, openScriptProject, rerunLastCommand, showAllCommands, surroundWith, visualModeYank, copyRegisteredCommandId } from './handler';

export class CommandTable {
    private builtInCommands = {
        openProject: openScriptProject,
        createProject,
        rerunLastCommand,
        showAllCommands: showAllCommands(this),
        copyRegisteredCommandId: copyRegisteredCommandId(this)
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

    private scriptCommands: string[] = [];

    public getAll() {
        const internalCommandTable = Object.entries(this.commands).map(([id, handler]) => {
            return { commandId: `${this.prefix}.${id}`, handler };
        }).reduce((table, { commandId, handler }) => {
            table[commandId] = handler;
            return table;
        }, {});
        const scriptCommandTable = this.scriptCommands.map(id => ({
            commandId: `${this.prefix}.${id}`, handler: (...args: any[]) => vscode.commands.executeCommand(id, ...args)
        })).reduce((table, { commandId, handler }) => {
            table[commandId] = handler;
            return table;
        }, {});
        return {
            ...internalCommandTable,
            ...scriptCommandTable
        };
    }

    private _internal: { [key: string]: (...args: any[]) => any } | undefined = undefined;
    /**
     * Internal Command Table
     */
    public get internal() {
        if (this._internal) {
            return this._internal;
        } else {
            this._internal = Object.entries(this.commands).map(([id, handler]) => {
                return { commandId: `${this.prefix}.${id}`, handler };
            }).reduce((table, { commandId, handler }) => {
                table[commandId] = handler;
                return table;
            }, {});
            return this._internal;
        }
    }

    public registerScriptCommand(commandId: string) {
        this.scriptCommands.push(commandId);
    }

    constructor(private prefix: string) { }
}
