'use babel';

import helper from './helper';

export function provide(indexer) {
  return (tipeString, projectDirectory, filePath) => {
    return new Promise(resolve => {
      const symbolsMatchingTypeReceived = indexer.onSymbolsMatchingTypeReceived(
        hints => {
          symbolsMatchingTypeReceived.dispose();
          return resolve(hints);
        }
      );
      indexer.getSymbolsMatchingType([tipeString, projectDirectory, filePath]);
    });
  };
}
