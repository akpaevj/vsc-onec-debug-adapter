import * as vscode from "vscode"
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

export class InfoBaseItem {
    name: string = "";
    properties = new Map<string, string|undefined>

    getId(): string|undefined {
        return this.properties.get("ID");
    }

    getConnectionString(): string|undefined {
        return this.properties.get("Connect");
    }

    isExternal(): Boolean {
        let value = this.properties.get("External");
        if (value == undefined || value == "")
            return false;
        return Number.parseInt(value) == 1;
    }
}

export function readUserInfoBases(): Array<InfoBaseItem> {
    let infoBases = new Array<InfoBaseItem>();

    let basePath = process.platform == "win32" ? process.env.appdata : process.env.user;
    if (basePath == undefined)
        return infoBases;

    let ibases = path.join(basePath.toString(), (process.platform == "win32" ? "" : ".") + "1C\\1CEStart\\ibases.v8i")

    if (fs.existsSync(ibases)) {
        let iBasesData = fs.readFileSync(ibases).toString();
        let basesInfo = iBasesData.split(/(?=\[.*\])/);

        var bases = [];
        basesInfo.filter(elem => elem.trim() != "").forEach(element => {
            let lines = element.split(/\r?\n/);
            let infoBaseItem = new InfoBaseItem();
            infoBaseItem.name = lines[0].substring(1, lines[0].length - 1);
            lines.slice(1).filter(c => c.trim() != "").map(line => {
                var i = line.indexOf('=');
                if (i < 0)
                    infoBaseItem.properties.set(line, undefined);
                else
                    infoBaseItem.properties.set(line.substring(0, i), line.substring(i + 1));
            });
            infoBases.push(infoBaseItem);
        });
    }

    return infoBases;
}