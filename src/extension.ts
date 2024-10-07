import * as vscode from "vscode"
import * as dt from "./debugTargets"
import * as aadt from "./autoAttachDebugTargets"

const debugTargetsProvider = new dt.DebugTargetsProvider();
let autoAttachDebugTargetsViewProvider : aadt.AutoAttachDebugTargetsViewProvider;

export function activate(context: vscode.ExtensionContext) {
    initDapExtension();
    initViews(context);
}

function initDapExtension() {
    vscode.debug.onDidStartDebugSession(session => {
        updateDebugTargets(session);
    });

    vscode.debug.onDidReceiveDebugSessionCustomEvent(ev => {
        switch (ev.event) {
            case "DebugTargetsUpdated":
                updateDebugTargets(ev.session);
                break;
            case "RaiseSetAutoAttachTargetTypes":
                raiseUpdateTargetTypes();
                break;
            default:
                break;
        }
    });
}

function initViews(context: vscode.ExtensionContext) {
    vscode.window.registerTreeDataProvider("debug.debugTargets", debugTargetsProvider);
    vscode.commands.registerCommand("debug.debugTargets.connect", (item: dt.DebugTargetItem) => {
        attachDebugTarget(item.Id);
    });

    autoAttachDebugTargetsViewProvider = new aadt.AutoAttachDebugTargetsViewProvider(context);
    vscode.window.registerWebviewViewProvider("debug.autoAttachDebugTargets", autoAttachDebugTargetsViewProvider);
}

function raiseUpdateTargetTypes() {
    autoAttachDebugTargetsViewProvider.webView?.postMessage({ command: "raiseUpdate" });
}

function attachDebugTarget(id: String) {
    vscode.debug.activeDebugSession?.customRequest("AttachDebugTargetRequest", { Id: id });
}

function updateDebugTargets(session: vscode.DebugSession) {
    session!.customRequest("DebugTargetsRequest").then(targets => {
        debugTargetsProvider.updateItems(targets.Items);
    });
}