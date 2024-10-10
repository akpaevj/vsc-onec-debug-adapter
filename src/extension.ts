import * as vscode from "vscode"
import * as dt from "./debugTargets"
import * as ib from "./infobasesList"
import * as dc from "./debugConfigurations"

export function activate(context: vscode.ExtensionContext) {
    vscode.debug.registerDebugConfigurationProvider("onec", new dc.OnecDebugConfigurationProvoider())
    initDapExtension(context);
    initViews(context);
}

function initDapExtension(context: vscode.ExtensionContext) {
    dc.watchTargetTypesChanged(context);

    context.subscriptions.push(
        vscode.debug.onDidStartDebugSession(session => {
            dt.updateDebugTargets(session);
        })
    );

    context.subscriptions.push(
        vscode.debug.onDidReceiveDebugSessionCustomEvent(ev => {
            switch (ev.event) {
                case "DebugTargetsUpdated":
                    dt.updateDebugTargets(ev.session);
                    break;
                default:
                    break;
            }
        })
    );
}

function initViews(context: vscode.ExtensionContext) {
    dt.init(context);
    ib.init(context);
}