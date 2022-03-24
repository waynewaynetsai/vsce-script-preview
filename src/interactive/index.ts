import * as vscode from 'vscode';

export const dropdown = async (title: string, items: string[], placeHolder: string) => {
   return await vscode.window.showQuickPick(items, {
       canPickMany: false,
       placeHolder,
       title
   });
};

export const input = async (prompt: string, placeHolder: string) => (await vscode.window.showInputBox({
    placeHolder,
    prompt,
})) || '';

export const confirm = async (title: string, placeHolder: 'Yes' | 'No' = 'No') => await vscode.window.showQuickPick(['Yes', 'No'], {
    title,
    canPickMany: false,
    placeHolder,
}).then(answer => answer === 'Yes');