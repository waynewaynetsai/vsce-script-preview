import * as vsc from 'vscode';

declare global {
    namespace NodeJS {
        interface Global {
            vscode: typeof vsc;
            lib: {
                
            }
        }
    }
}