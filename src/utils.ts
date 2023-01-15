import { TextDocument, Range } from "vscode";
import { BetterFoldingRange } from "./types";

export function groupArrayToMap<T, V>(array: T[], getValue: (element: T) => V, defaultValue?: V): Map<V, T[]> {
  const map: Map<V, T[]> = new Map();

  for (const element of array) {
    const value = getValue(element) ?? defaultValue;
    if (!value) continue;

    const valueCollection = map.get(value);
    if (!valueCollection) {
      map.set(value, [element]);
    } else {
      valueCollection.push(element);
    }
  }

  return map;
}

export function foldingRangeToRange(document: TextDocument): (foldingRange: BetterFoldingRange) => Range {
  return (foldingRange) =>
    new Range(
      foldingRange.start,
      foldingRange.startColumn ?? document.lineAt(foldingRange.start).text.length,
      foldingRange.end,
      document.lineAt(foldingRange.end).text.length
    );
}