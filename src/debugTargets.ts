import * as vscode from "vscode"

export class DebugTargetItem {
    Id: string = "";
    User: string = "";
    Seance: string = "";
    Type: string = "";
}

export class DebugTargetsProvider implements vscode.TreeDataProvider<DebugTargetItem> {

    private items: DebugTargetItem[] = [];
    data: vscode.TreeItem[] = [];
    
    private changeEvent = new vscode.EventEmitter<void>();

    updateItems(items: DebugTargetItem[]) {
        this.items = items;
        this.data = items.map<vscode.TreeItem>(value => {
            let item = new vscode.TreeItem(`${value.Type} (${value.User}, ${value.Seance})`)
            item.id = value.Id;
            item.contextValue = value.Id

            return item;
        })
        this.changeEvent.fire();
    }

    onDidChangeTreeData?: vscode.Event<void | DebugTargetItem | DebugTargetItem[] | null | undefined> | undefined = this.changeEvent.event;

    getTreeItem(element: DebugTargetItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        let index = this.items.indexOf(element);
        return this.data[index];
    }
    getChildren(element?: DebugTargetItem | undefined): vscode.ProviderResult<DebugTargetItem[]> {
        if (element == undefined)
            return this.items;

        return []
    }
    getParent?(element: DebugTargetItem): vscode.ProviderResult<DebugTargetItem> {
        throw new Error("Method not implemented.");
    }
    resolveTreeItem?(item: vscode.TreeItem, element: DebugTargetItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }
}