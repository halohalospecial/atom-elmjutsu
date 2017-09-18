'use babel';
import path from 'path';
import marked from 'marked';
import * as React from 'react';
import _ from 'underscore-plus';
import helper from './helper';

export default {
  create(activeTokenHints, activeFile, goToDefinitionFunction) {
    const packageDocsPrefix = helper.getPackageDocsPrefix();
    const newline = '  \n';
    const items = _.flatten(activeTokenHints.map((hint) => {
      const formattedModuleName = hint.moduleName === '' || activeFile.filePath === hint.sourcePath ? '' : hint.moduleName + '.';
      const formattedName = hint.name === helper.holeToken() ? hint.name : (helper.isInfix(hint.name) ? '(' + hint.name + ')' : hint.name);
      const formattedTipe = hint.tipe === '' ? (hint.args.length > 0 ? '*' + hint.args.join(' ') + '*' : '') : (formattedName !== '' ? ': ' + hint.tipe : hint.tipe);
      const maybeAliasesOfType = atom.config.get('elmjutsu.showAliasesOfTypesInTooltip') ? hint.aliasesOfTipe.map((tipeAlias) => { return ' *a.k.a.* ' + tipeAlias; }).join('') : '';
      const maybeType = atom.config.get('elmjutsu.showTypesInSidekick') ? ('#### ' + formattedModuleName + (formattedName.trim().length > 0 ? '**' + formattedName + '** ' : '') + formattedTipe + maybeAliasesOfType) : '';
      const headCase = _.first(hint.cases);
      const tailCases = _.rest(hint.cases);
      const maybeTypeCases = atom.config.get('elmjutsu.showTypeCasesInSidekick') && hint.cases.length > 0 ? (newline + '= ' + caseToString(headCase) + newline + tailCases.map((kase) => { return '| ' + caseToString(kase); }).join(newline) + (tailCases.length > 0 ? newline : '')) : '';
      const maybeComment = atom.config.get('elmjutsu.showDocCommentsInSidekick') ? (hint.comment === '' ? '' : newline + hint.comment) : '';
      const maybeAssociativity = atom.config.get('elmjutsu.showAssociativitiesInSidekick') ? (hint.associativity ? newline + 'Associativity: ' + hint.associativity: '') : '';
      const maybePrecedence = atom.config.get('elmjutsu.showPrecedencesInSidekick') ? (hint.precedence ? newline + 'Precedence: ' + hint.precedence : '') : '';
      const topMarkdown = marked(maybeType + maybeTypeCases, {sanitize: true});
      const commentMarkdown = marked(maybeComment, {sanitize: true});
      const bottomMarkdown = marked(maybeAssociativity + maybePrecedence, {sanitize: true});
      return {topMarkdown, commentMarkdown, bottomMarkdown, hint};
    }));

    class DatatipView extends React.PureComponent {
      render() {
        const itemCount = items.length;
        const elements = items.map(({topMarkdown, commentMarkdown, bottomMarkdown, hint}, i) => {
          let sourcePathView;
          if (hint.sourcePath.startsWith(packageDocsPrefix)) {
            sourcePathView = (
              <span className="icon-link-external">
                <a title={hint.sourcePath} href={hint.sourcePath}>{hint.sourcePath.replace(packageDocsPrefix, '')}</a>
              </span>);
          } else {
            sourcePathView = (
              <a title={hint.sourcePath} onClick={e => { goToDefinitionFunction() }}>{hint.sourcePath.replace(activeFile.projectDirectory + path.sep, '')}</a>
            );
          }
          return (
            <div className="datatip-marked-container">
              <div className="elmjutsu-datatip">
                <div
                  dangerouslySetInnerHTML={{
                    __html: topMarkdown,
                  }}
                  key={i}
                />
                <div className="comment"
                  dangerouslySetInnerHTML={{
                    __html: commentMarkdown,
                  }}
                  key={itemCount + i}
                />
                <div
                  dangerouslySetInnerHTML={{
                    __html: bottomMarkdown,
                  }}
                  key={itemCount*2 + i}
                />
                <div className="source-path"
                  key={itemCount*3 + i}>
                  {sourcePathView}
                </div>
              </div>
            </div>
          );
        });
        return (
          <div className="datatip-marked">
            {elements}
          </div>
        );
      }
    }
    return DatatipView;
  }
}

function caseToString({name, args}) {
  if (args.length > 0) {
    return name + ' ' + args.join(' ');
  }
  return name;
}
