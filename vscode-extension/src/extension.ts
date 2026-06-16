import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('BestRobloxMCP extension activated');

  const refreshCommand = vscode.commands.registerCommand('bestrobloxmcp.refreshTree', () => {
    vscode.window.showInformationMessage('BestRobloxMCP: Refresh Studio Tree (not yet implemented)');
  });

  const syncPullCommand = vscode.commands.registerCommand('bestrobloxmcp.syncPull', () => {
    vscode.window.showInformationMessage('BestRobloxMCP: Sync Pull (not yet implemented)');
  });

  const syncPushCommand = vscode.commands.registerCommand('bestrobloxmcp.syncPush', () => {
    vscode.window.showInformationMessage('BestRobloxMCP: Sync Push (not yet implemented)');
  });

  context.subscriptions.push(refreshCommand, syncPullCommand, syncPushCommand);
}

export function deactivate() {
  console.log('BestRobloxMCP extension deactivated');
}
