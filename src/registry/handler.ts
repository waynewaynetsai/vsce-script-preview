import { execCmd, invokeCommands, runMacro, spawnShell } from "../command";
import { copyProjectTemplate, getCurrentLine, getCursorPosition, openProject, switchToInsertModeSelection } from "../editor";
import { confirm, dropdown, input } from "../interactive";
import { logger } from "../logger";
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { QuickpickCommandItem, QuickpickSetting } from "../models";
import { Instantiator } from "../instantiator";
import { CommandRegistry } from "./registry";
import { CommandTable } from "./table";

// Dirty code here, take it easy!
export async function createProject() {
    // STEP0: if there is defined project or given path, check whether override original project path config or not?
    const existProjectPath = vscode.workspace.getConfiguration('vsce-script').get<string>('projectPath');
    console.log('existProjectPath', existProjectPath);
    if (existProjectPath && existProjectPath !== '') {
        const projectName = path.basename(existProjectPath);
        const ok = await confirm(`You have an exist script project (${projectName}), Open this project?`);
        if (ok) {
            const newWindow = await confirm('Open project in new window?');
            await openProject(existProjectPath, { newWindow });
            return;
        }
    }
    // STEP1: ask typescript or javascript
    const projectType: string | undefined = await dropdown('Create Typescript or Javascript script project?', [
        'javascript',
        'typescript'
    ], 'typescript');
    if (!projectType)
        return;
    // STEP2: select folder
    const projectUris = await vscode.window.showOpenDialog({
        title: 'Select a folder to create extension project',
        openLabel: 'Create Project',
        canSelectFolders: true,
        canSelectFiles: false,
        defaultUri: vscode.workspace.workspaceFolders?.[0].uri
    });
    if (!projectUris)
        return;
    if (!projectUris?.[0])
        return;
    const projectName = await input('Input your project name', 'vsce-script-project');
    if (!projectName || projectName === '') return;
    console.log('projectName', projectName);
    const projectPath = path.join(projectUris?.[0].fsPath, projectName);
    console.log('projectPath', projectPath);
    const isProjectExist = fs.existsSync(projectPath);
    if (isProjectExist) {
        const reuseProject = await confirm('Project is exist, Open this project?');
        if (reuseProject) {
            await invokeCommands([openProject(projectPath)]);
            return;
        }
    } else {
        vscode.workspace.getConfiguration('vsce-script')
            .update('projectPath', path.resolve(projectPath));
    }
    console.log('Step3', projectPath);
    // STEP3: generate project template/copy file or folder
    try {
        const projectTemplatePath = path.resolve(__dirname, `../template/${projectType}`);
        await copyProjectTemplate(projectTemplatePath, projectPath, { overwrite: false });
    } catch (err) {
        logger.error(`Fail to create script project: ${JSON.stringify(err)}`);
        vscode.window.showErrorMessage(`Fail to create script project: ${JSON.stringify(err)}`);
    }
    const useNpm = await dropdown('Use yarn or npm ?', ['yarn', 'npm'], 'npm') === 'npm';
    const newWindow = await confirm('Open project at new window?');
    invokeCommands([
        // STEP4: install project deps
        useNpm ? spawnShell(`npm`, ['install'], { cwd: projectPath }) : spawnShell(`yarn`, [], { cwd: projectPath }),
        // STEP5: open project folder
        openProject(projectPath, { newWindow })
    ]);
}

export const openScriptProject = async () => {
    const existProjectPath = vscode.workspace.getConfiguration('vsce-script').get<string>('projectPath');
    if (existProjectPath) {
        const newWindow = await confirm('Open project in new window?');
        console.log('newWindow', newWindow);
        console.log('existProjectPath', existProjectPath);
        await openProject(existProjectPath, { newWindow })();
    } else {
        vscode.window.showInformationMessage('No project found! Please create a project first!');
    }
};

export const insertDeclaration: (...args: any[]) => any = (args) => {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor)
        return;
    try {
        const { inserting, replacing, type } = args;
        activeTextEditor.edit(editBuilder => {
            const replacingStart = new vscode.Position(replacing.start.line, replacing.start.character);
            const replacingEnd = new vscode.Position(replacing.end.line, replacing.end.character + type.length + 1);
            editBuilder.replace(new vscode.Range(replacingStart, replacingEnd), ';');
        }).then(_ => {
            activeTextEditor.insertSnippet(
                new vscode.SnippetString(type + " ${1:newLocal} = "),
                new vscode.Position(inserting.line, inserting.character)
            );
        });
    } catch (error) {
        console.error(error);
    }
};


export const addBracket = async (editor: vscode.TextEditor) => {
    const str = getCurrentLine(editor);
    const lastChar = str.charAt(str.length - 1);
    const hasWhitespace = lastChar === " ";
    const hasClosedParen = lastChar === ')';
    const hasOpenedParen = str.includes('(');
    if (hasWhitespace) {
        await runMacro(["{", "}", "<left>", "\n"]);
    } else if (!hasClosedParen && hasOpenedParen) {
        await runMacro([")", " ", "{", "}", "<left>", "\n"]);
    } else {
        await runMacro([" ", "{", "}", "<left>", "\n"]);
    }
};

export const surroundWith = async (cmd: string) => {
    await invokeCommands([
        switchToInsertModeSelection,
        execCmd(cmd ?? "surround.with")
    ]);
};

export const visualModeYank = async () => {
    await runMacro(['<Esc>', 'm', 'y', 'y', '`', 'y']);
};

export const rerunLastCommand = async () => {
    const commandRegistry = Instantiator.container.get<CommandRegistry>(CommandRegistry);
    const lastCommandInfo = commandRegistry.lastExecutedCommand;
    if (lastCommandInfo) {
        await vscode.commands.executeCommand(lastCommandInfo.command, lastCommandInfo.args);
    } else {
        vscode.window.showErrorMessage('Has no last command!');
    }
};

export const showAllCommands = (table: CommandTable) => async (namespaces: string[] = []) => {
    const commandIds = Object.keys(table.getAll());
    const displayCommandIds = namespaces.length > 0 ? commandIds.filter(k => namespaces.some(n => k.includes(`.${n}.`))) : commandIds;
    const commandId = await dropdown('Show all commands', displayCommandIds, '');
    if (commandId && commandId !== '') {
        await vscode.commands.executeCommand(commandId);
    }
};

export const copyRegisteredCommandId = (table: CommandTable) => async () => {
    const commandIds = Object.keys(table.getAll()); 
    const commandId = await dropdown('Show all commands', commandIds, '');
    if (commandId && commandId !== '') {
        await vscode.env.clipboard.writeText(commandId);
        vscode.window.showInformationMessage(`Copy commandId: ${commandId}!`);
    }
};

export const commandQuickpick = async (setting: QuickpickSetting) => {
    const items: QuickpickCommandItem[] = setting.items.map(originalSetting => ({
        ...originalSetting,
        description: `$(gear)command:${originalSetting.command}`,
    }));
    const selected = await vscode.window.showQuickPick(items, {
        title: setting.title,
        matchOnDescription: true
    });
    if (!selected)
        return;
    await vscode.commands.executeCommand(selected.command!, selected.args!);
};