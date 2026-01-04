function PrintHeader() {
  console.log('\n');
}

function PrintFileDiscovery(files) {
  if (files.length === 0) {
    console.warn('No .jsonl files willing to show up in Src/');
    return;
  }
  
  console.log(`Found ${files.length} chatty file(s) hanging in Src/ >`);
  files.forEach(file => {
    const fileName = file.split('\\').pop();
    console.log(`  > ${fileName}`);
  });
  console.log('');
}

function PrintProcessingStart(fileName, mode) {
  const modeNames = { 1: 'Safe', 2: 'Medium', 3: 'Aggressive' };
  console.log(`\nWorking on > ${fileName}`);
  console.log(`Mode > ${modeNames[mode]}\n`);
}

function PrintValidationResult(parseResult, validationResult, initialOrphanLog) {
  if (parseResult.success) {
    console.log(`Parsed > ${parseResult.validMessages} messages`);
  } else {
    console.warn(`Parse hiccups > ${parseResult.errors.length}`);
  }
  
  if (initialOrphanLog) {
    console.log(`Deleted > ${initialOrphanLog.orphansDeleted} orphaned tool pair(s)`);
  }
  
  console.log(`Validated > ${validationResult.totalPairs} tool pairs`);
}

function PrintCompressionResult(compressionResult) {
  const reduction = Math.round((1 - compressionResult.compressedCount / compressionResult.originalCount) * 100);
  console.log(`Squeezed > ${compressionResult.originalCount} → ${compressionResult.compressedCount} messages, ${reduction}% slimmer`);
}

function PrintOutputSuccess(outputFileName) {
  console.log(`Spilled to > ${outputFileName}`);
}

function PrintError(message) {
  console.error(`Oops > ${message}`);
}

function PrintWarning(message) {
  console.warn(`Careful > ${message}`);
}

function PrintInfo(message) {
  console.log(`${message}`);
}

export { 
  PrintHeader, 
  PrintFileDiscovery, 
  PrintProcessingStart, 
  PrintValidationResult, 
  PrintCompressionResult, 
  PrintOutputSuccess,
  PrintError,
  PrintWarning,
  PrintInfo
};
