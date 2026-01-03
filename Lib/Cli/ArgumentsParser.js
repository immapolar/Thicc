import { program } from 'commander';

function ParseArguments() {
  program
    .name('Thicc')
    .description('Claude Code JSONL Conversations Compression Tool')
    .version('1.0.0')
    .option('-s, --safe', 'Use safe compression mode (5-10% reduction)')
    .option('-m, --medium', 'Use medium compression mode (10-20% reduction)')
    .option('-a, --aggressive', 'Use aggressive compression mode (15-25% reduction)')
    .option('--hard', 'Alias for aggressive mode')
    .option('--smart <sessionId>', 'Smart real-time monitoring mode (3-7% per pass, monitors active session)')
    .option('--mode <number>', 'Specify mode by number (1=safe, 2=medium, 3=aggressive, 4=smart)')
    .parse();

  const options = program.opts();
  
  if (options.safe) return { mode: 1, interactive: false, smart: false };
  if (options.medium) return { mode: 2, interactive: false, smart: false };
  if (options.aggressive || options.hard) return { mode: 3, interactive: false, smart: false };
  if (options.smart) return { mode: 4, interactive: false, smart: true, sessionId: options.smart };
  if (options.mode) {
    const modeNum = parseInt(options.mode);
    if (modeNum >= 1 && modeNum <= 4) {
      return { mode: modeNum, interactive: false, smart: modeNum === 4 };
    }
  }
  
  return { mode: null, interactive: true, smart: false };
}

export { ParseArguments };
