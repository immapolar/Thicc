import fs from 'fs/promises';

async function PatchFile(filePath, deleteStartIndex, deleteEndIndex, allLines) {
  try {
    const linesToKeep = [
      ...allLines.slice(0, deleteStartIndex),
      ...allLines.slice(deleteEndIndex + 1)
    ];
    
    const newContent = linesToKeep.join('\n') + '\n';
    
    await fs.writeFile(filePath, newContent, 'utf-8');
    
    return {
      success: true,
      linesDeleted: (deleteEndIndex - deleteStartIndex + 1),
      newLineCount: linesToKeep.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function GetFileLines(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    return { success: true, lines };
  } catch (error) {
    return { success: false, error: error.message, lines: [] };
  }
}

export { PatchFile, GetFileLines };
