import { ValidateToolPairs } from '../Validation/ToolPairValidator.js';
import { FindAndDeleteOrphans } from '../Helpers/OrphanResolver.js';

function CompressSmart(messages, validationData) {
  const minReduction = Math.ceil(messages.length * 0.03);
  const maxReduction = Math.ceil(messages.length * 0.07);
  
  let targetPairIndex = -1;
  let deleteStartIndex = -1;
  let resultIndex = -1;
  let deletionCount = 0;
  let finalResultIndex = -1;
  
  for (let pairIndex = validationData.pairs.length - 1; pairIndex >= 0; pairIndex--) {
    const pair = validationData.pairs[pairIndex];
    const pairResultIndex = pair.toolResult.messageIndex;
    
    let preferredStartIndex = -1;
    let fallbackStartIndex = 0;
    
    for (let i = pairResultIndex - 1; i >= 0; i--) {
      const msg = messages[i];
      
      if (msg.type === 'file-history-snapshot') {
        preferredStartIndex = i + 1;
        break;
      }
      
      if (msg.type === 'summary' && preferredStartIndex === -1) {
        preferredStartIndex = i + 1;
      }
    }
    
    if (preferredStartIndex === -1) {
      preferredStartIndex = 0;
    }
    
    let preferredCount = pairResultIndex - preferredStartIndex;
    let fallbackCount = pairResultIndex - fallbackStartIndex;
    
    if (preferredCount >= minReduction && preferredCount <= maxReduction) {
      targetPairIndex = pairIndex;
      deleteStartIndex = preferredStartIndex;
      deletionCount = preferredCount;
      finalResultIndex = pairResultIndex;
      break;
    } else if (fallbackCount >= minReduction && fallbackCount <= maxReduction && targetPairIndex === -1) {
      targetPairIndex = pairIndex;
      deleteStartIndex = fallbackStartIndex;
      deletionCount = fallbackCount;
      finalResultIndex = pairResultIndex;
      break;
    }
  }
  
  if (targetPairIndex === -1) {
    return {
      messages: messages,
      originalCount: messages.length,
      compressedCount: messages.length,
      removalLog: [],
      mode: 'smart',
      skipped: true,
      reason: `Too tight to squeeze > need ${minReduction}-${maxReduction} messages`,
      deleteStartIndex: -1,
      deleteEndIndex: -1
    };
  }

  const targetPair = validationData.pairs[targetPairIndex];
  resultIndex = finalResultIndex;
  
  let stopReason = null;
  for (let i = resultIndex - 1; i >= deleteStartIndex; i--) {
    const msg = messages[i];
    if (msg.type === 'file-history-snapshot') {
      stopReason = 'file-history-snapshot';
      break;
    }
    if (msg.type === 'summary') {
      stopReason = 'summary';
    }
  }
  if (!stopReason) stopReason = 'start-of-file';

  const compressed = [
    ...messages.slice(0, deleteStartIndex),
    ...messages.slice(resultIndex)
  ];

  const validation = ValidateToolPairs(compressed);
  
  let finalMessages = compressed;
  let orphanLog = null;
  
  if (validation.hasOrphans) {
    const orphanResult = FindAndDeleteOrphans(compressed, validation.orphanedUses, validation.orphanedResults);
    finalMessages = orphanResult.messages;
    orphanLog = {
      orphansDeleted: orphanResult.deletedCount,
      orphanIndices: orphanResult.deletedIndices
    };
  }

  const removalLog = [{
    deletedRange: `[${deleteStartIndex}, ${resultIndex - 1}]`,
    deletedCount: deletionCount,
    stopReason: stopReason,
    targetToolPair: targetPairIndex + 1,
    toolUseId: targetPair.id,
    minReduction: minReduction,
    maxReduction: maxReduction,
    orphans: orphanLog
  }];

  return {
    messages: finalMessages,
    originalCount: messages.length,
    compressedCount: finalMessages.length,
    removalLog,
    mode: 'smart',
    deleteStartIndex: deleteStartIndex,
    deleteEndIndex: resultIndex - 1
  };
}

export { CompressSmart };
