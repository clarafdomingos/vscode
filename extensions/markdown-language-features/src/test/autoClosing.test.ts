/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import 'mocha';
import * as vscode from 'vscode';
import { joinLines } from './util';

const testFile = workspaceFile('autoClosingTest.md');

function workspaceFile(...segments: string[]) {
	return vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, ...segments);
}

async function withFileContents(file: vscode.Uri, contents: string): Promise<void> {
	const document = await vscode.workspace.openTextDocument(file);
	const editor = await vscode.window.showTextDocument(document);
	await editor.edit(edit => {
		edit.replace(new vscode.Range(0, 0, 1000, 0), contents);
	});
}

(vscode.env.uiKind === vscode.UIKind.Web ? suite.skip : suite)('Markdown Auto-Closing Tests', () => {

	setup(async () => {
		await vscode.extensions.getExtension('vscode.markdown-language-features')!.activate();
	});

	teardown(async () => {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	test('Should not auto-complete <> inside LaTeX inline block', async () => {
		// LaTeX block inline
		await withFileContents(testFile, joinLines(
			'$ $',
			''
		));

		const editor = vscode.window.activeTextEditor!;

		const position = new vscode.Position(0, 1);
		editor.selection = new vscode.Selection(position, position);

		await vscode.commands.executeCommand('type', { text: '<' });

		const text = editor.document.getText();
		assert.strictEqual(text.indexOf('<>'), -1);
	});

	test('Should not auto-complete <> inside LaTeX display block', async () => {
		// LaTeX block display
		await withFileContents(testFile, joinLines(
			'$$ $$',
			''
		));

		const editor = vscode.window.activeTextEditor!;
		const position = new vscode.Position(0, 2);
		editor.selection = new vscode.Selection(position, position);

		await vscode.commands.executeCommand('type', { text: '<' });

		const text = editor.document.getText();
		assert.strictEqual(text.indexOf('<>'), -1);
	});
});
