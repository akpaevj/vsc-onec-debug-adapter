import * as vscode from "vscode"

class AutoAttachDebugTargetsViewProvider implements vscode.WebviewViewProvider {

    private htmlUri: vscode.Uri

    webView: vscode.Webview|undefined = undefined

    constructor(extContext: vscode.ExtensionContext) {
        this.htmlUri = vscode.Uri.joinPath(extContext.extensionUri, "resources/autoAttachDebugTargetsView.html")
    }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): Thenable<void> | void {
        webviewView.webview.options = {
            enableScripts: true
        }
        webviewView.webview.onDidReceiveMessage((message) => {
            if (message.command == "updated") {
                vscode.debug.activeDebugSession?.customRequest("SetAutoAttachTargetTypesRequest", {
                    types: message.targets
                })
            }
        });
        vscode.workspace.fs.readFile(this.htmlUri).then(data => {
            webviewView.webview.html = data.toString()
        })

        this.webView = webviewView.webview

        token.onCancellationRequested(() => {this.webView = undefined})
    }
}

let autoAttachDebugTargetsViewProvider : AutoAttachDebugTargetsViewProvider;

export function init(context: vscode.ExtensionContext) {
    autoAttachDebugTargetsViewProvider = new AutoAttachDebugTargetsViewProvider(context);
    vscode.window.registerWebviewViewProvider("debug.autoAttachDebugTargets", autoAttachDebugTargetsViewProvider);
}

export function raiseUpdateTargetTypes() {
    autoAttachDebugTargetsViewProvider.webView?.postMessage({ command: "raiseUpdate" });
}