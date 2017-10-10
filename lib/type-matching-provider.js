'use babel';

import helper from './helper';

export function provide(indexer) {
  return (tipeString, projectDirectory, filePath) => {
    return new Promise(resolve => {
      const functionsMatchingTypeReceived = indexer.onFunctionsMatchingTypeReceived(
        hints => {
          functionsMatchingTypeReceived.dispose();
          return resolve(hints);
        }
      );
      indexer.getFunctionsMatchingType([
        tipeString,
        projectDirectory,
        filePath,
      ]);
    });
  };
}
