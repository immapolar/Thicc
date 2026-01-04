import path from 'path';
import { ReadFile } from '../Io/FileReader.js';
import { WriteFile } from '../Io/FileWriter.js';
import { ParseJsonl } from '../Validation/JsonlParser.js';
import { ValidateToolPairs } from '../Validation/ToolPairValidator.js';
import { FindAndDeleteOrphans } from '../Helpers/OrphanResolver.js';
import { Compress } from '../Compression/CompressionOrchestrator.js';

async function ProcessConversation(filePath, mode, modelName, temperature, outputDir) {
  const fileName = path.basename(filePath, '.jsonl');
  
  const readResult = await ReadFile(filePath);
  if (!readResult.success) {
    return { success: false, error: `Oops, file too shy > ${readResult.error}` };
  }

  const parseResult = ParseJsonl(readResult.content);
  if (!parseResult.success || parseResult.messages.length === 0) {
    return { success: false, error: 'JSONL refused to talk', parseResult };
  }

  let workingMessages = parseResult.messages;
  let initialOrphanLog = null;
  
  const initialValidation = ValidateToolPairs(workingMessages);
  
  if (initialValidation.hasOrphans) {
    const orphanResult = FindAndDeleteOrphans(
      workingMessages,
      initialValidation.orphanedUses,
      initialValidation.orphanedResults
    );
    workingMessages = orphanResult.messages;
    initialOrphanLog = {
      orphansDeleted: orphanResult.deletedCount,
      orphanIndices: orphanResult.deletedIndices
    };
  }
  
  const toolPairValidation = ValidateToolPairs(workingMessages);

  const compressionResult = await Compress(
    workingMessages,
    toolPairValidation,
    mode,
    modelName,
    temperature
  );

  const outputFileName = `${fileName}_compressed.jsonl`;
  const outputPath = path.join(outputDir, outputFileName);

  const outputLines = compressionResult.messages.map(msg => JSON.stringify(msg)).join('\n') + '\n';

  const writeResult = await WriteFile(outputPath, outputLines);
  
  if (!writeResult.success) {
    return { success: false, error: `Couldn't stuff the output > ${writeResult.error}` };
  }

  return {
    success: true,
    outputFileName,
    parseResult,
    toolPairValidation,
    compressionResult,
    initialOrphanLog
  };
}

export { ProcessConversation };
