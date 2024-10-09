import * as vscode from "vscode"

export function getOnecConfigurations() : Array<vscode.DebugConfiguration> {
    var config = vscode.workspace.getConfiguration("launch");
    let configurations = config.get<Array<vscode.DebugConfiguration>>("configurations");
    if (configurations == undefined)
        return [];

    return configurations.filter(c => c.type == "onec");
}

export function watchTargetTypesChanged(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (vscode.debug.activeDebugSession != undefined && event.affectsConfiguration("launch.configurations")) {
                let onecConfigs = getOnecConfigurations();
                let debugSessionConfig = vscode.debug.activeDebugSession.configuration;
                let sessionConfigs = onecConfigs.filter(c => c.name == debugSessionConfig.name);
                if (sessionConfigs.length == 1) {
                    let newTargets: string[] = sessionConfigs[0].autoAttachTypes
                    vscode.debug.activeDebugSession.customRequest("SetAutoAttachTargetTypesRequest", { types: newTargets })
                }
            }
        })
    );
}