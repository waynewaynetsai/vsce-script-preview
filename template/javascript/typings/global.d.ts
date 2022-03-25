import * as vsc from 'vscode';

declare global {
    const vscode: typeof vsc;
    const lib: any;
}
