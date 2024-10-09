import * as vscode from "vscode"
import * as v8 from "./v8"
import * as dc from "./debugConfigurations"

class InfoBasesTreeProvider implements vscode.TreeDataProvider<v8.InfoBaseItem> {

    private items: v8.InfoBaseItem[] = [];
    data: vscode.TreeItem[] = [];
    
    private changeEvent = new vscode.EventEmitter<void>();

    raiseUpdate() {
        this.items = v8.readUserInfoBases();
        let onecConfigurations = dc.getOnecConfigurations();

        this.data = this.items.map<vscode.TreeItem>(value => {
            let item = new vscode.TreeItem(value.name)
            item.tooltip = value.getConnectionString();

            let debugConfigs = onecConfigurations.filter(c => c.infoBase == value.name);

            if (debugConfigs.length > 0) {
                item.iconPath = new vscode.ThemeIcon("debug-stackframe", new vscode.ThemeColor("focusBorder"));
                let configNames = onecConfigurations.map(c => c.name).join("\r\n");
                item.tooltip = value.getConnectionString() ?.concat("\r\n", configNames);
            }

            return item;
        })
        this.changeEvent.fire();
    }

    onDidChangeTreeData?: vscode.Event<void | v8.InfoBaseItem | v8.InfoBaseItem[] | null | undefined> | undefined = this.changeEvent.event;

    getTreeItem(element: v8.InfoBaseItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        let index = this.items.indexOf(element);
        return this.data[index];
    }
    getChildren(element?: v8.InfoBaseItem | undefined): vscode.ProviderResult<v8.InfoBaseItem[]> {
        if (element == undefined)
            return this.items;

        return []
    }
    getParent?(element: v8.InfoBaseItem): vscode.ProviderResult<v8.InfoBaseItem> {
        throw new Error("Method not implemented.");
    }
    resolveTreeItem?(item: vscode.TreeItem, element: v8.InfoBaseItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }
}

const infoBasesViewProvider = new InfoBasesTreeProvider();

export function init(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(infoBasesViewProvider.raiseUpdate));
    context.subscriptions.push(vscode.window.registerTreeDataProvider("explorer.infoBases", infoBasesViewProvider));
    context.subscriptions.push(
        vscode.commands.registerCommand("explorer.infoBases.setAsMain", (item: v8.InfoBaseItem) => {
            var config = vscode.workspace.getConfiguration("launch");
            let configurations = config.get<Array<vscode.DebugConfiguration>>("configurations");
            if (configurations == undefined)
                return;
    
            let onecConfigurations = configurations.filter(c => c.type == "onec");
    
            if (onecConfigurations.length == 0) {
                vscode.window.showInformationMessage("Не найдены конфигурации отладки 1С:Предприятие")
                return;
            }
    
            vscode.window.showQuickPick(onecConfigurations.map(c => c.name), {
                title: "Выберите конфигурацию отладки"
            }).then(value => {
                if (value != undefined) {
                    configurations.filter(c => c.name == value).forEach(c => {
                        c.infoBase = item.name;
                    });
                    config.update("configurations", configurations).then(() => {
                        infoBasesViewProvider.raiseUpdate();
                    });
                }
            });
        })
    );

    infoBasesViewProvider.raiseUpdate();
}