import path from 'path';
import { fileURLToPath } from 'url';
import { ScanForJsonlFiles } from './Lib/Io/DirectoryScanner.js';
import { ParseArguments } from './Lib/Cli/ArgumentsParser.js';
import { PromptForMode } from './Lib/Cli/InteractivePrompt.js';
import { CheckOllamaAvailability } from './Lib/Ai/OllamaClient.js';
import { SelectBestModel, GetModelFromEnvironment, GetTemperatureFromEnvironment } from './Lib/Ai/ModelSelector.js';
import { ProcessConversation } from './Lib/Core/ConversationProcessor.js';
import { FindSessionFile } from './Lib/Io/SessionFileFinder.js';
import { MonitorAndCompress } from './Lib/Core/SmartMonitor.js';
import { 
  PrintHeader, 
  PrintFileDiscovery, 
  PrintProcessingStart, 
  PrintValidationResult, 
  PrintCompressionResult, 
  PrintOutputSuccess,
  PrintError,
  PrintWarning,
  PrintInfo
} from './Lib/Cli/OutputFormatter.js';
import { ConsoleInterceptor } from './Lib/Cli/ConsoleInterceptor.js';
import { AsciiAnimator } from './Lib/Cli/AsciiAnimator.js';
import { ShimmerStatus } from './Lib/Cli/ShimmerStatus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const thiccAscii = `
⣿⣿⣿⣿⣿⣷⣿⣿⣿⡅⡹⢿⠆⠙⠋⠉⠻⠿⣿⣿⣿⣿⣿⣿⣮⠻⣦⡙⢷⡑⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣌⠡⠌⠂⣙⠻⣛⠻⠷⠐⠈⠛⢱⣮⣷⣽⣿
⣿⣿⣿⣿⡇⢿⢹⣿⣶⠐⠁⠀⣀⣠⣤⠄⠀⠀⠈⠙⠻⣿⣿⣿⣦⣵⣌⠻⣷⢝⠦⠚⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣻⣿⣊⡃⠀⣙⠿⣿⣿⣿⣎⢮⡀⢮⣽⣿⣿
⢿⣿⣿⣿⣧⡸⡎⡛⡩⠖⠀⣴⣿⣿⣿⠀⠀⠀⠀⠸⠇⠀⠙⢿⣿⣿⣿⣷⣌⢷⣑⢷⣄⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣫⠶⠛⠉⠀⠁⠀⠈⠈⠀⠠⠜⠻⣿⣆⢿⣼⣿⣿⣿
⢐⣿⣿⣿⣿⣧⢧⣧⢻⣦⢀⣹⣿⣿⣿⣇⠀⠄⠀⠀⠀⡀⠀⠈⢻⣿⣿⣿⣿⣷⣝⢦⡹⠷⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⠈⠁⠀⠀⠀⠁⠀⠀⠀⠱⣶⣄⡀⠀⠈⠛⠜⣿⣿⣿⣿
⠀⠊⢫⣿⣏⣿⡌⣼⣄⢫⡌⣿⣿⣿⣿⣿⣦⡈⠲⣄⣤⣤⡡⢀⣠⣿⣿⣿⣿⣿⣿⣷⣼⣍⢬⣦⡙⣿⣿⣿⣿⣿⣯⢁⡄⠀⡀⡀⠀⠄⢈⣠⢪⠀⣿⣿⣿⣦⠀⢉⢂⠹⡿⣿⣿
⠀⠀⠄⢹⢃⢻⣟⠙⣿⣦⠱⢻⣿⣿⣿⣿⣿⣿⣷⣬⣍⣭⣥⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⡙⢿⣼⡿⣿⣿⣿⣿⣿⣷⣄⠘⣱⢦⣤⡴⡿⢈⣼⣿⣿⣿⣇⣴⣶⣮⣅⢻⣿⡏
⠀⠀⠈⠹⣇⢡⢿⡆⠻⣿⣷⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣍⡻⣿⣟⣻⣿⣿⣿⣿⣷⣦⣥⣬⣤⣴⣾⣿⣿⣿⣿⣷⣿⣿⣿⣿⣷⡜⠃
⠀⠀⠀⢀⣘⠈⢂⠃⣧⡹⣿⣷⡄⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⣅⡙⢿⣟⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠋⡕⠂
⠀⠀⠀⠀⠀⠀⠛⢷⣜⢷⡌⠻⣿⣿⣦⣝⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣹⣷⣦⣹⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠉⠃⠀
`;

async function Main() {
  console.clear();

  const animator = new AsciiAnimator(thiccAscii, {
    startColor: '#f48fb1',
    endColor: '#ce93d8',
    delay: 80
  });

  await animator.play();

  const consoleInterceptor = new ConsoleInterceptor({
    startColor: '#f34e3f',
    endColor: '#410604'
  });
  consoleInterceptor.interceptAll();

  const srcDir = path.join(__dirname, 'Src');
  const distDir = path.join(__dirname, 'Dist');

  const argResult = ParseArguments();
  let mode = argResult.mode;

  if (argResult.smart && argResult.sessionId) {
    PrintHeader();
    
    console.log(' Smart Mode Activated\n');
    
    const findResult = await FindSessionFile(argResult.sessionId);
    
    if (!findResult.success) {
      PrintError(findResult.error);
      process.exit(1);
    }
    
    const sizeKB = (findResult.fileSize / 1024).toFixed(2);
    console.log(` Session found!`);
    console.log(`   Project > ${findResult.projectName}`);
    console.log(`   Current size > ${sizeKB} KB`);
    
    await MonitorAndCompress(findResult.filePath, argResult.sessionId);
    return;
  }

  if (argResult.interactive) {
    PrintHeader();
    
    const scanResult = await ScanForJsonlFiles(srcDir);
    PrintFileDiscovery(scanResult.files);
    
    if (scanResult.files.length === 0) {
      PrintInfo('Drop your Claude Code .jsonl chats into Src/ and try again');
      process.exit(0);
    }

    const promptResult = await PromptForMode();
    
    if (promptResult.cancelled) {
      process.exit(1);
    }
    
    mode = promptResult.mode;
    
    if (mode === 4 && promptResult.sessionId) {
      console.log('\n Smart Mode Activated\n');
      
      const findResult = await FindSessionFile(promptResult.sessionId);
      
      if (!findResult.success) {
        PrintError(findResult.error);
        process.exit(1);
      }
      
      const sizeKB = (findResult.fileSize / 1024).toFixed(2);
      console.log(` Session found!`);
      console.log(`   Project > ${findResult.projectName}`);
      console.log(`   Current size > ${sizeKB} KB`);
      
      await MonitorAndCompress(findResult.filePath, promptResult.sessionId);
      return;
    }
  } else {
    PrintHeader();
  }

  const scanResult = await ScanForJsonlFiles(srcDir);
  
  if (!argResult.interactive) {
    PrintFileDiscovery(scanResult.files);
  }

  if (scanResult.files.length === 0) {
    PrintError('No Claude Code .jsonl chats hiding in Src/');
    process.exit(1);
  }

  let modelName = GetModelFromEnvironment();
  const temperature = GetTemperatureFromEnvironment();
  let useAI = true;

  if (mode === 2 || mode === 3) {
    const ollamaCheck = await CheckOllamaAvailability();
    
    if (!ollamaCheck.available) {
      PrintWarning('Ollama not available. Falling back to safe mode.');
      PrintInfo('Want medium or aggressive modes? install Ollama > https://ollama.ai');
      mode = 1;
      useAI = false;
    } else {
      if (!modelName) {
        const modelResult = await SelectBestModel();
        
        if (modelResult.fallback) {
          PrintWarning('No AI hot enough, switching to safe mode');
          PrintInfo('Grab a model > ollama pull mistral');
          mode = 1;
          useAI = false;
        } else {
          modelName = modelResult.model;
          PrintInfo(`Using sexy AI model > ${modelName}`);
        }
      }
    }
  }

  for (const filePath of scanResult.files) {
    const fileName = path.basename(filePath);
    PrintProcessingStart(fileName, mode);

    const result = await ProcessConversation(filePath, mode, modelName, temperature, distDir);

    if (!result.success) {
      PrintError(result.error);
      continue;
    }

    PrintValidationResult(result.parseResult, result.toolPairValidation);
    
    if (mode === 2 || mode === 3) {
      if (useAI) {
        PrintInfo('Squeezing context with AI...');
      }
    }
    
    PrintCompressionResult(result.compressionResult);
    PrintOutputSuccess(result.outputFileName);
  }

  console.log('');
  PrintInfo('All squeezed!');
}

Main().catch(error => {
  PrintError(error.message);
  console.error(error);
  process.exit(1);
});
