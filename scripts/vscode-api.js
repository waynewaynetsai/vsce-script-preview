const ApiContext = class {
    get vscode() {
        return this._vscode ?? {};
    }
    set vscode(vsc) {
        this._vscode = vsc;
    }
    constructor(vsc) {
        this._vscode = vsc;
    }
    setContext(ctx, apiData) {
        this.vscode = apiData.vscodeApi;
        this.context = ctx;
        this.api = apiData;
    }
};

module.exports = {
    get vscode() {
        return ApiContext.vscode;
    },
    setupModule2: (ctx, apiData) => {
        ApiContext.vscode = apiData.vscodeApi;
        ApiContext.context = ctx;
        ApiContext.api = apiData;
    }
};