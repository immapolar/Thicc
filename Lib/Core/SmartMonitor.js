import fs from 'fs/promises';
import { ParseJsonl } from '../Validation/JsonlParser.js';
import { ValidateToolPairs } from '../Validation/ToolPairValidator.js';
import { FindAndDeleteOrphans } from '../Helpers/OrphanResolver.js';
import { CompressSmart } from '../Compression/SmartMode.js';
import { PatchFile, GetFileLines } from '../Io/FilePatcher.js';
import { ShimmerStatus } from '../Cli/ShimmerStatus.js';

const SHIMMER_TEXTS = [
  'Monitoring...',
  'Watching...',
  'Observing...',
  'Tracking...',
  'Scanning...',
  'Checking...',
  'Surveying...',
  'Inspecting...',
  'Analyzing...',
  'Supervising...'
];

const COLOR_PAIRS = [
  { base: '#ff9800', shimmer: '#ffeb3b' },
  { base: '#e91e63', shimmer: '#f48fb1' },
  { base: '#9c27b0', shimmer: '#ce93d8' },
  { base: '#673ab7', shimmer: '#b39ddb' },
  { base: '#3f51b5', shimmer: '#9fa8da' },
  { base: '#2196f3', shimmer: '#90caf9' },
  { base: '#03a9f4', shimmer: '#81d4fa' },
  { base: '#00bcd4', shimmer: '#80deea' },
  { base: '#009688', shimmer: '#80cbc4' },
  { base: '#4caf50', shimmer: '#a5d6a7' },
  { base: '#8bc34a', shimmer: '#c5e1a5' },
  { base: '#cddc39', shimmer: '#e6ee9c' },
  { base: '#ffeb3b', shimmer: '#fff59d' },
  { base: '#ffc107', shimmer: '#ffe082' },
  { base: '#ff9800', shimmer: '#ffcc80' },
  { base: '#ff5722', shimmer: '#ff8a65' },
  { base: '#f44336', shimmer: '#ef5350' },
  { base: '#e91e63', shimmer: '#ec407a' },
  { base: '#9c27b0', shimmer: '#ab47bc' },
  { base: '#673ab7', shimmer: '#7e57c2' }
];

function getRandomShimmerConfig() {
  const text = SHIMMER_TEXTS[Math.floor(Math.random() * SHIMMER_TEXTS.length)];
  const colors = COLOR_PAIRS[Math.floor(Math.random() * COLOR_PAIRS.length)];
  return {
    text: `   ${text}`,
    color: colors.base,
    shimmerColor: colors.shimmer
  };
}

async function MonitorAndCompress(filePath, sessionId) {
  const INITIAL_THRESHOLD_KB = 1500;
  const INCREMENTAL_THRESHOLD_KB = 500;
  const POLL_INTERVAL_MS = 3000;
  
  console.log(`\n Smart monitoring session > ${sessionId}`);
  console.log(` Path > ${filePath}`);
  console.log(`  Initial threshold > ${INITIAL_THRESHOLD_KB} KB`);
  console.log(`  Incremental threshold > +${INCREMENTAL_THRESHOLD_KB} KB per pass`);
  console.log(`  Check interval > ${POLL_INTERVAL_MS / 1000}s\n`);
  
  const config = getRandomShimmerConfig();
  const shimmer = new ShimmerStatus({
    text: config.text,
    color: config.color,
    shimmerColor: config.shimmerColor,
    duration: 2000,
    interval: 50
  });
  
  shimmer.start();
  
  let compressionCount = 0;
  let nextCompressionThreshold = INITIAL_THRESHOLD_KB;
  
  const monitor = setInterval(async () => {
    try {
      const stats = await fs.stat(filePath);
      const currentSizeKB = stats.size / 1024;
      
      if (currentSizeKB >= nextCompressionThreshold) {
        shimmer.stop();
        
        console.log(`\n Threshold reached > ${currentSizeKB.toFixed(2)} KB >= ${nextCompressionThreshold.toFixed(2)} KB`);
        console.log(` Initiating smart compression pass #${++compressionCount}...\n`);
        
        const linesResult = await GetFileLines(filePath);
        if (!linesResult.success) {
          console.error(`    Failed to read file > ${linesResult.error}`);
          return;
        }
        
        const parseResult = ParseJsonl(linesResult.lines.join('\n'));
        if (!parseResult.success || parseResult.messages.length === 0) {
          console.error('    JSONL parsing failed');
          return;
        }
        
        let workingMessages = parseResult.messages;
        
        const initialValidation = ValidateToolPairs(workingMessages);
        if (initialValidation.hasOrphans) {
          const orphanResult = FindAndDeleteOrphans(
            workingMessages,
            initialValidation.orphanedUses,
            initialValidation.orphanedResults
          );
          workingMessages = orphanResult.messages;
          console.log(`     Deleted ${orphanResult.deletedCount} pre-existing orphaned tool pair(s)`);
        }
        
        const validationData = ValidateToolPairs(workingMessages);
        const compressionResult = CompressSmart(workingMessages, validationData);
        
        if (compressionResult.skipped) {
          console.log(`     ${compressionResult.reason}`);
          console.log(`     Continuing monitoring...\n`);
          
          const newConfig = getRandomShimmerConfig();
          shimmer.shimmer.options.text = newConfig.text;
          shimmer.shimmer.options.color = newConfig.color;
          shimmer.shimmer.options.shimmerColor = newConfig.shimmerColor;
          shimmer.start();
          return;
        }
        
        const patchResult = await PatchFile(
          filePath,
          compressionResult.deleteStartIndex,
          compressionResult.deleteEndIndex,
          linesResult.lines
        );
        
        if (!patchResult.success) {
          console.error(`    File patching failed > ${patchResult.error}`);
          return;
        }
        
        const newStats = await fs.stat(filePath);
        const newSizeKB = newStats.size / 1024;
        const reduction = currentSizeKB - newSizeKB;
        const reductionPercent = ((reduction / currentSizeKB) * 100).toFixed(2);
        
        nextCompressionThreshold = newSizeKB + INCREMENTAL_THRESHOLD_KB;
        
        console.log(`    Compression successful!`);
        console.log(`    ${compressionResult.originalCount} → ${compressionResult.compressedCount} messages`);
        console.log(`    ${currentSizeKB.toFixed(2)} KB → ${newSizeKB.toFixed(2)} KB (-${reduction.toFixed(2)} KB, -${reductionPercent}%)`);
        console.log(`     Deleted lines > ${patchResult.linesDeleted}`);
        console.log(`     Next compression at > ${nextCompressionThreshold.toFixed(2)} KB`);
        console.log(`     Continuing monitoring...\n`);
        
        const newConfig = getRandomShimmerConfig();
        shimmer.shimmer.options.text = newConfig.text;
        shimmer.shimmer.options.color = newConfig.color;
        shimmer.shimmer.options.shimmerColor = newConfig.shimmerColor;
        shimmer.start();
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        shimmer.stop();
        console.log(`\n  Session file disappeared (maybe deleted)`);
        console.log(` Total compressions performed > ${compressionCount}`);
        clearInterval(monitor);
      }
    }
  }, POLL_INTERVAL_MS);
  
  process.on('SIGINT', () => {
    shimmer.stop();
    clearInterval(monitor);
    console.log(`\n\n Monitoring stopped`);
    console.log(` Total compressions performed > ${compressionCount}`);
    process.exit(0);
  });
}

export { MonitorAndCompress };
