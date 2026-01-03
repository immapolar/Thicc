import fs from 'fs/promises';
import path from 'path';
import { homedir } from 'os';

async function FindSessionFile(sessionId) {
  const baseDir = path.join(homedir(), '.claude', 'projects');
  
  try {
    const subdirs = await fs.readdir(baseDir, { withFileTypes: true });
    
    for (const entry of subdirs) {
      if (entry.isDirectory()) {
        const projectDir = path.join(baseDir, entry.name);
        
        try {
          const files = await fs.readdir(projectDir);
          const targetFile = `${sessionId}.jsonl`;
          
          if (files.includes(targetFile)) {
            const fullPath = path.join(projectDir, targetFile);
            const stats = await fs.stat(fullPath);
            
            return {
              success: true,
              filePath: fullPath,
              projectName: entry.name,
              fileSize: stats.size
            };
          }
        } catch (err) {
          continue;
        }
      }
    }
    
    return {
      success: false,
      error: `Session ${sessionId}.jsonl not found in any project`
    };
  } catch (error) {
    return {
      success: false,
      error: `Cannot access .claude/projects > ${error.message}`
    };
  }
}

export { FindSessionFile };
