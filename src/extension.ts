import { ExtensionContext, languages, window, workspace } from "vscode";
import { BracketRangesProvider } from "./providers/bracketRangesProvider";
import { CONFIG_ID } from "./constants";
import FoldingDecorator from "./decorators/foldingDecorator";
import * as config from "./configuration";
import FoldedLinesManager from "./utils/classes/foldedLinesManager";
import { ProvidersList } from "./types";
import BetterFoldingRangeProvider from "./providers/betterFoldingRangeProvider";

const bracketRangesProvider = new BracketRangesProvider();
const providers: ProvidersList = [
  ["go", bracketRangesProvider],
];

let foldingDecorator = new FoldingDecorator(providers);
const registeredLanguages = new Set<string>();

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    foldingDecorator,

    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(CONFIG_ID)) {
        restart();
        updateAllDocuments();
      }
    }),

    window.onDidChangeVisibleTextEditors(() => {
      updateAllDocuments();
      registerProviders(context);
    }),

    workspace.onDidChangeTextDocument((e) => {
      providers.forEach(([_, provider]) => provider.updateRanges(e.document));
    }),

    window.onDidChangeTextEditorVisibleRanges((e) => {
      FoldedLinesManager.updateFoldedLines(e.textEditor);
      foldingDecorator.triggerUpdateDecorations(e.textEditor);
    }),
);

  registerProviders(context);
  updateAllDocuments();
}

function registerProviders(context: ExtensionContext) {
  const excludedLanguages = config.excludedLanguages();

  for (const editor of window.visibleTextEditors) {
    const languageId = editor.document.languageId;

    if (!registeredLanguages.has(languageId) && !excludedLanguages.includes(languageId)) {
      registeredLanguages.add(languageId);

      for (const [selector, provider] of providers) {
        if (selector === languageId || selector === "*") registerProvider(context, languageId, provider);
      }
    }
  }
}

function registerProvider(context: ExtensionContext, selector: string, provider: BetterFoldingRangeProvider) {
  context.subscriptions.push(languages.registerFoldingRangeProvider(selector, provider));
}

function updateAllDocuments() {
  bracketRangesProvider.updateAllDocuments();
  for (const e of window.visibleTextEditors) {
    providers.forEach(([_, provider]) => provider.updateRanges(e.document));
  }
  for (const e of window.visibleTextEditors) {
    providers.forEach(([_, provider]) => provider.updateRanges(e.document));
  }
  FoldedLinesManager.updateAllFoldedLines();
  foldingDecorator.triggerUpdateDecorations();
}

function restart() {
  providers.forEach(([_, provider]) => provider.restart());

  foldingDecorator.dispose();
  foldingDecorator = new FoldingDecorator(providers);
}

export function deactivate() {
  foldingDecorator.dispose();
}
