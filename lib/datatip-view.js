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
      const typeMarkdown = marked(maybeType, {sanitize: true});
      const typeCasesAndCommentMarkdown = marked(maybeTypeCases + maybeComment, {sanitize: true});
      return {typeMarkdown, typeCasesAndCommentMarkdown, maybeAssociativity, maybePrecedence, hint};
    }));

    class DatatipView extends React.PureComponent {
      render() {
        const itemCount = items.length;
        const elements = items.map(({typeMarkdown, typeCasesAndCommentMarkdown, maybeAssociativity, maybePrecedence, hint}, i) => {
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
                    __html: typeMarkdown,
                  }}
                  key={i}
                />
                <div className="comment"
                  dangerouslySetInnerHTML={{
                    __html: typeCasesAndCommentMarkdown,
                  }}
                  key={itemCount + i}
                />
                <div key={itemCount*2 + i}>
                  {maybeAssociativity}
                </div>
                <div key={itemCount*3 + i}>
                  {maybePrecedence}
                </div>
                <div className="source-path"
                  key={itemCount*4 + i}>
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
