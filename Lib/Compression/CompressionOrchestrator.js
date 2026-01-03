import { CompressSafe } from './SafeMode.js';
import { CompressMedium } from './MediumMode.js';
import { CompressAggressive } from './AggressiveMode.js';
import { CompressSmart } from './SmartMode.js';

async function Compress(messages, validationData, mode, modelName, temperature) {
  if (mode === 1 || mode === 'safe') {
    return CompressSafe(messages, validationData);
  } else if (mode === 2 || mode === 'medium') {
    return await CompressMedium(messages, validationData, modelName, temperature);
  } else if (mode === 3 || mode === 'aggressive') {
    return await CompressAggressive(messages, validationData, modelName, temperature);
  } else if (mode === 4 || mode === 'smart') {
    return CompressSmart(messages, validationData);
  } else {
    throw new Error(`Can't handle this squeeze > ${mode}`);
  }
}

export { Compress };
