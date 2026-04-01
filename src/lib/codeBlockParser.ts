export interface CodeBlock {
  id: string; // "calculateTotal"
  type: "function" | "class" | "component" | "method" | "arrow";
  name: string;
  startLine: number;
  endLine: number;
  content: string;
  language: string;
}

/**
 * Parse code blocks from source code
 * Supports JavaScript/TypeScript functions, classes, and React components
 */
export function parseCodeBlocks(
  code: string,
  language: string = "typescript"
): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const lines = code.split("\n");

  // Regular expressions for different block types
  const functionRegex =
    /^\s*(export\s+)?(async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/;
  const arrowFunctionRegex =
    /^\s*(export\s+)?(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(async\s+)?\(/;
  const classRegex = /^\s*(export\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/;
  const componentRegex =
    /^\s*(export\s+)?(const|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=\(]/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let match;

    // Check for function declaration
    match = line.match(functionRegex);
    if (match) {
      const name = match[3];
      const startLine = i;
      const endLine = findBlockEnd(lines, i);
      const content = lines.slice(startLine, endLine + 1).join("\n");

      blocks.push({
        id: name,
        type: "function",
        name,
        startLine,
        endLine,
        content,
        language,
      });

      i = endLine + 1;
      continue;
    }

    // Check for arrow function
    match = line.match(arrowFunctionRegex);
    if (match) {
      const name = match[3];
      const startLine = i;
      const endLine = findBlockEnd(lines, i);
      const content = lines.slice(startLine, endLine + 1).join("\n");

      blocks.push({
        id: name,
        type: "arrow",
        name,
        startLine,
        endLine,
        content,
        language,
      });

      i = endLine + 1;
      continue;
    }

    // Check for class declaration
    match = line.match(classRegex);
    if (match) {
      const name = match[2];
      const startLine = i;
      const endLine = findBlockEnd(lines, i);
      const content = lines.slice(startLine, endLine + 1).join("\n");

      blocks.push({
        id: name,
        type: "class",
        name,
        startLine,
        endLine,
        content,
        language,
      });

      i = endLine + 1;
      continue;
    }

    // Check for React component (heuristic)
    if (
      line.includes("export") &&
      line.match(/const|function/) &&
      !blocks.find((b) => b.startLine === i)
    ) {
      match = line.match(componentRegex);
      if (match) {
        const name = match[3];
        const startLine = i;
        const endLine = findBlockEnd(lines, i);
        const content = lines.slice(startLine, endLine + 1).join("\n");

        blocks.push({
          id: name,
          type: "component",
          name,
          startLine,
          endLine,
          content,
          language,
        });

        i = endLine + 1;
        continue;
      }
    }

    i++;
  }

  return blocks;
}

/**
 * Find the end line of a code block by tracking braces
 */
function findBlockEnd(lines: string[], startLine: number): number {
  let braceCount = 0;
  let inBlock = false;

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];

    // Count opening and closing braces
    for (const char of line) {
      if (char === "{") {
        braceCount++;
        inBlock = true;
      } else if (char === "}") {
        braceCount--;
        if (inBlock && braceCount === 0) {
          return i;
        }
      }
    }
  }

  // If braces don't match, return end of file
  return lines.length - 1;
}

/**
 * Get the code block at a specific cursor line
 */
export function getBlockAtCursor(
  code: string,
  lineNumber: number,
  language: string = "typescript"
): CodeBlock | null {
  const blocks = parseCodeBlocks(code, language);

  for (const block of blocks) {
    if (lineNumber >= block.startLine && lineNumber <= block.endLine) {
      return block;
    }
  }

  return null;
}

/**
 * Find a specific block by ID
 */
export function getBlockById(
  code: string,
  blockId: string,
  language: string = "typescript"
): CodeBlock | null {
  const blocks = parseCodeBlocks(code, language);
  return blocks.find((b) => b.id === blockId) || null;
}

/**
 * Get all block IDs for a given code
 */
export function getBlockIds(
  code: string,
  language: string = "typescript"
): string[] {
  const blocks = parseCodeBlocks(code, language);
  return blocks.map((b) => b.id);
}

/**
 * Validate if a blockId exists in code
 */
export function validateBlockId(
  code: string,
  blockId: string,
  language: string = "typescript"
): boolean {
  return getBlockById(code, blockId, language) !== null;
}
