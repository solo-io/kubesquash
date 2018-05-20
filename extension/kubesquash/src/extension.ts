'use strict';

import * as kube from './kube-interfaces';
import * as shelljs from 'shelljs';


// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const OutPort = 1236


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "kubesquash" is now active!');

    let se = new SquashExtention(context);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.debugPod', async () => {
        // The code you place here will be executed every time your command is executed
        try {
            await se.debug();
        } catch (err) {
            if (err.message) {
                vscode.window.showErrorMessage(err.message);
            } else {
                vscode.window.showErrorMessage("Unknown error has occurred");
            }
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export class PodPickItem implements vscode.QuickPickItem {
    label: string;
    description: string;
    detail?: string;

    pod: kube.Pod;

    constructor(pod: kube.Pod) {
        let podname = pod.metadata.name;
        let nodename = pod.spec.nodeName;
        this.label = `${podname} (${nodename})`;
        this.description = "pod";
        this.pod = pod;
    }
}
class SquashExtention {

    context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    async debug() {
        /*
            run the squashkube binary with -server
        */

        if (!vscode.workspace.workspaceFolders) {
            throw new Error("no workspace folders");

        }

        let workspace : vscode.WorkspaceFolder;
        if (vscode.workspace.workspaceFolders.length == 0) {
            throw new Error("Can't start debugging without a project open");
        } else if (vscode.workspace.workspaceFolders.length == 1) {
            workspace = vscode.workspace.workspaceFolders[0];
        } else {
            let wfoptions: vscode.QuickPickOptions = {
                placeHolder: "Please a project to debug",
            };
            let wfItems = vscode.workspace.workspaceFolders.map(
                wf =>new WorkspaceFolderPickItem(wf));

            const item = await vscode.window.showQuickPick(wfItems, wfoptions);

            if (item) {
                workspace = item.obj;
            } else {
                console.log("debugging canceled");
                return;
            }
        }

        /*
           get namespace and pod
        */
       let pods = await this.getPods();

       let podoptions: vscode.QuickPickOptions = {
            placeHolder: "Please select a pod",
        };

        let podItems: PodPickItem[] = pods.map(pod => new PodPickItem(pod));

        const item = await vscode.window.showQuickPick(podItems, podoptions);

        if (!item) {
            console.log("chosing pod canceled - debugging canceled");
            return;
        }
        let selectedPod = item.pod;

        // now invoke kubesquash
        let stdout = await exec(`kubesquash -debug-server=true -pod ${selectedPod.metadata.name} -namespace ${selectedPod.metadata.namespace}`);
        let squashPodRegex = /pod.name:\s+(\d+)\s*$/g;
        let match = squashPodRegex.exec(stdout);
        if (match == null) {
            throw new Error("can't parse output of kubesquash");
        }
        // get created pod name
        let squashPodName = match[1];
        let pa = new PodAddress("squash", squashPodName, OutPort);

        // port forward
        let localport = await kubectl_portforward(pa);

        // start debugging!
        let debuggerconfig : vscode.DebugConfiguration =  {
            type: "go",
            name: "Remote",
            request: "launch",
            mode: "remote",
            port: localport,
            host: "127.0.0.1",
        //    program: localpath,
        //    remotePath: remotepath,
        //    stopOnEntry: true,
            env: {},
            args: [],
            showLog: true,
            trace: "verbose"
        };

        return vscode.debug.startDebugging(
            workspace,
            debuggerconfig
        );

    }

    async  getPods(): Promise<kube.Pod[]> {
        const podsjson = await kubectl_get<kube.PodList>("pods", "--all-namespaces");
        return podsjson.items;
    }

}


export class WorkspaceFolderPickItem implements vscode.QuickPickItem {
    label: string;
    description: string;
    detail?: string;
    obj: vscode.WorkspaceFolder;

    constructor(obj: vscode.WorkspaceFolder) {
        this.label = obj.name;
        this.obj = obj;
        this.description = "workspace";
    }
}


export class PodAddress {
    podName : string;
    podNamespace : string;
    port: number;

    constructor(podNamespace : string, podName :string, port : number) {
        this.podNamespace = podNamespace;
        this.podName = podName;
        this.port = port;
    }
}

function kubectl_portforward(remote: PodAddress): Promise<number> {

    let cmd = get_conf_or("kubectl-path", "kubectl") + ` --namespace=${remote.podNamespace} port-forward ${remote.podName} :${remote.port}`;
    console.log("Executing: " + cmd);
    let p = new Promise<number>((resolve, reject) => {
        let resolved = false;
        let handler = function (code : number, stdout : string, stderr : string) {
            if (resolved != true) {
                if (code !== 0) {
                    reject(new ExecError(code, stdout, stderr));
                } else {
                    reject(new Error("Didn't receive port"));
                }
            } else {
                console.log(`port forward ended unexpectly: ${code} ${stdout} ${stderr} `)
            }
        };
        let child = shelljs.exec(cmd, handler);
        let stdout = "";
        child.stdout.on('data', function (data) {
            stdout += data;
            let portRegexp = /from\s+.+:(\d+)\s+->/g;
            let match = portRegexp.exec(stdout);
            if (match != null) {
                resolved = true;
                resolve(parseInt(match[1]))
            }
        });
    });

    return p;
}

function kubectl_get<T=any>(cmd: string, ...args: string[]): Promise<T> {
    return kubectl("get -o json " + cmd + " " + args.join(" ")).then(JSON.parse);
}


function kubectl(cmd:string): Promise<string> {
    return exec(get_conf_or("kubectl-path", "kubectl") + " " + cmd);
}

// https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
class ExecError extends Error {
    code: number;
    stderr: string;
    stdout: string;

    constructor(code: number, stdout: string, stderr: string) {
        super((stdout+stderr).trim());

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ExecError.prototype);

        this.code = code;
        this.stderr = stderr;
        this.stdout = stdout;
    }
}


function exeAsync(cmd:string) {
    console.log("Executing: " + cmd);
    let options = { async: true };
    shelljs.exec(cmd);
}


async function exec(cmd:string): Promise<string> {
    console.log("Executing: " + cmd);
    let promise = new Promise<string>((resolve, reject) => {
        let handler = function (code: number, stdout: string, stderr: string) {
            if (code !== 0) {
                reject(new ExecError(code, stdout, stderr));
            } else {
                resolve(stdout);
            }
        };

        let options = {
         async: true,
         stdio: ['ignore', 'pipe', 'pipe'],
        };
        shelljs.exec(cmd, options, handler);
    });

    return promise;
}

function get_conf_or(k : string, d : any) : any {
    let config = vscode.workspace.getConfiguration('vs-squash');
    let v = config[k];
    if (!v) {
        return d;
    }
    return v;
}
