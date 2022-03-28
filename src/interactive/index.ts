import * as vscode from 'vscode';

export const dropdown = async (title: string, items: string[], placeHolder: string, options: vscode.QuickPickOptions = {}) => {
   return await vscode.window.showQuickPick(items, {
       canPickMany: false,
       placeHolder,
       title,
       ...options
   });
};

export const input = async (prompt: string, placeHolder: string, options: vscode.InputBoxOptions = {}) => (await vscode.window.showInputBox({
    placeHolder,
    prompt,
    ...options
})) || '';

export const confirm = async (title: string, placeHolder: 'Yes' | 'No' = 'No', options: vscode.QuickPickOptions = {}) => await vscode.window.showQuickPick(['Yes', 'No'], {
    title,
    canPickMany: false,
    placeHolder,
    ...options
}).then(answer => answer === 'Yes');