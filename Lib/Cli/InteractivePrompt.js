import readline from 'readline';

async function PromptForMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('Compression Modes:');
    console.log('  1. Safe       (5-10% reduction, minimal context loss)');
    console.log('  2. Medium     (10-20% reduction, balanced)');
    console.log('  3. Aggressive (15-25% reduction, significant context loss)');
    console.log('  4. Smart      (3-7% per pass, real-time monitoring - requires session ID)');
    console.log('');
    
    rl.question('Mode > ', (answer) => {
      const mode = parseInt(answer.trim());
      
      if (mode >= 1 && mode <= 4) {
        if (mode === 4) {
          rl.question('Session ID > ', (sessionId) => {
            rl.close();
            const trimmedId = sessionId.trim();
            if (trimmedId) {
              resolve({ mode, cancelled: false, sessionId: trimmedId });
            } else {
              console.log('\nSession ID required for Smart mode');
              resolve({ mode: null, cancelled: true });
            }
          });
        } else {
          rl.close();
          resolve({ mode, cancelled: false });
        }
      } else {
        rl.close();
        console.log('\nMode too picky > use 1, 2, 3, or 4');
        resolve({ mode: null, cancelled: true });
      }
    });
  });
}

export { PromptForMode };
