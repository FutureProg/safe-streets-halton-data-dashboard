export interface Cursor {
  id: string;
  date: string;
}

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

export function decodeCursor(cursorStr: string): Cursor {
  const decodedStr = Buffer.from(cursorStr, "base64").toString("utf-8");
  return JSON.parse(decodedStr) as Cursor;
}
