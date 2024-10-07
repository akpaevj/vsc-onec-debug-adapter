import * as vscode from "vscode"
import * as dt from "./debugTargets"
import * as aadt from "./autoAttachDebugTargets"

export function activate(context: vscode.ExtensionContext) {
    initDapExtension();
    initViews(context);
}

function initDapExtension() {
    vscode.debug.onDidStartDebugSession(session => {
        dt.updateDebugTargets(session);
    });

    vscode.debug.onDidReceiveDebugSessionCustomEvent(ev => {
        switch (ev.event) {
            case "DebugTargetsUpdated":
                dt.updateDebugTargets(ev.session);
                break;
            case "RaiseSetAutoAttachTargetTypes":
                aadt.raiseUpdateTargetTypes();
                break;
            default:
                break;
        }
    });
}

function initViews(context: vscode.ExtensionContext) {
    dt.init();
    aadt.init(context);
}