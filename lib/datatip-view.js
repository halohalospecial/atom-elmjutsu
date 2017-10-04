'use babel';
import path from 'path';
import marked from 'marked';
import * as React from 'react';
import _ from 'underscore-plus';
import helper from './helper';

export default {
  create(
    activeTokenHints,
    activeFile,
    getTokenInfoFunction,
    goToDefinitionFunction
  ) {
    const packageDocsPrefix = helper.getPackageDocsPrefix();
    const newline = '  \n';
    const items = _.flatten(
      activeTokenHints.map(hint => {
        const headCase = _.first(hint.cases);
        const tailCases = _.rest(hint.cases);
        const maybeTypeCases =
          atom.config.get('elmjutsu.showTypeCasesInSidekick') &&
          hint.cases.length > 0
            ? newline +
              '= ' +
              caseToString(headCase) +
              newline +
              tailCases
                .map(kase => {
                  return '| ' + caseToString(kase);
                })
                .join(newline) +
              (tailCases.length > 0 ? newline : '')
            : '';
        const maybeComment = atom.config.get(
          'elmjutsu.showDocCommentsInSidekick'
        )
          ? hint.comment === '' ? '' : newline + hint.comment
          : '';
        const maybeAssociativity = atom.config.get(
          'elmjutsu.showAssociativitiesInSidekick'
        )
          ? hint.associativity
            ? newline + 'Associativity: ' + hint.associativity
            : ''
          : '';
        const maybePrecedence = atom.config.get(
          'elmjutsu.showPrecedencesInSidekick'
        )
          ? hint.precedence ? newline + 'Precedence: ' + hint.precedence : ''
          : '';
        const typeCasesAndCommentMarkdown = marked(
          maybeTypeCases + maybeComment,
          { sanitize: true }
        );
        return {
          typeInfo: hint.typeInfo,
          typeCasesAndCommentMarkdown,
          maybeAssociativity,
          maybePrecedence,
          hint,
        };
      })
    );

    class DatatipView extends React.PureComponent {
      render() {
        const itemCount = items.length;
        const elements = items.map(
          (
            {
              typeInfo,
              typeCasesAndCommentMarkdown,
              maybeAssociativity,
              maybePrecedence,
              hint,
            },
            i
          ) => {
            const {
              maybeModuleName,
              maybeName,
              maybeArgs,
              maybeTipe,
              maybeAliasesOfType,
            } = typeInfo;
            const maybeTipeView = formatTypeParts(
              maybeTipe,
              getTokenInfoFunction,
              goToDefinitionFunction
            );
            let sourcePathView;
            if (hint.sourcePath.startsWith(packageDocsPrefix)) {
              sourcePathView = (
                <span className="icon-link-external">
                  <a
                    title={'Open in browser:\n' + hint.sourcePath}
                    href={hint.sourcePath}
                  >
                    {hint.sourcePath.replace(packageDocsPrefix, '')}
                  </a>
                </span>
              );
            } else {
              sourcePathView = (
                <a
                  title={'Go to definition in\n' + hint.sourcePath}
                  onClick={e => {
                    goToDefinitionFunction();
                  }}
                >
                  {hint.sourcePath.replace(
                    activeFile.projectDirectory + path.sep,
                    ''
                  )}
                </a>
              );
            }
            return (
              <div className="datatip-marked-container">
                <div className="elmjutsu-datatip">
                  <h4 key={i}>
                    {maybeModuleName}
                    <strong>{maybeName}</strong>
                    <em>{maybeArgs}</em>
                    {maybeTipeView}
                    {maybeAliasesOfType}
                  </h4>
                  <div
                    className="comment"
                    dangerouslySetInnerHTML={{
                      __html: typeCasesAndCommentMarkdown,
                    }}
                    key={itemCount + i}
                  />
                  <div key={itemCount * 2 + i}>{maybeAssociativity}</div>
                  <div key={itemCount * 3 + i}>{maybePrecedence}</div>
                  <div className="source-path" key={itemCount * 4 + i}>
                    {sourcePathView}
                  </div>
                </div>
              </div>
            );
          }
        );
        return <div className="datatip-marked">{elements}</div>;
      }
    }
    return DatatipView;
  },
};

function caseToString({ name, args }) {
  if (args.length > 0) {
    return name + ' ' + args.join(' ');
  }
  return name;
}

// From `linter-elm-make`.
function formatTypeParts(
  partsString,
  getTokenInfoFunction,
  goToDefinitionFunction
) {
  if (!partsString || partsString.length === 0) {
    return '';
  }
  let parts = [];
  let i = 0;
  let acc = '';
  let currentIsToken = undefined;
  const n = partsString.length;
  while (i < n) {
    const ch = partsString[i];
    if (ch === '-' && i + 1 < n && partsString[i + 1] === '>') {
      if (currentIsToken === true) {
        parts.push(
          formatTypePart(acc, getTokenInfoFunction, goToDefinitionFunction)
        );
        acc = '';
      }
      currentIsToken = false;
      acc += '->';
      i += 2;
    } else if ([' ', ',', ':', '|', '{', '}', '(', ')', '\n'].includes(ch)) {
      if (currentIsToken === true) {
        parts.push(
          formatTypePart(acc, getTokenInfoFunction, goToDefinitionFunction)
        );
        acc = '';
      }
      currentIsToken = false;
      acc += ch;
      i++;
    } else {
      if (currentIsToken === false) {
        parts.push(formatText(acc));
        acc = '';
      }
      currentIsToken = true;
      acc += ch;
      i++;
    }
    if (i === n) {
      if (currentIsToken === true) {
        parts.push(
          formatTypePart(acc, getTokenInfoFunction, goToDefinitionFunction)
        );
      } else {
        parts.push(formatText(acc));
      }
    }
  }
  return _.flatten(parts);
}

function formatTypePart(text, getTokenInfoFunction, goToDefinitionFunction) {
  if (text.length > 0) {
    if (isAType(text)) {
      return (
        <span
          className="elmjutsu-token-actionable"
          onMouseEnter={e => getTokenInfoFunction(text)}
          onClick={e => goToDefinitionFunction(text)}
        >
          {formatText(text)}
        </span>
      );
    } else {
      return formatText(text);
    }
  }
  return '';
}

function formatText(text) {
  if (text.length === 0) {
    return '';
  }
  const parts = text.split(/\n/g);
  const lastIndex = parts.length - 1;
  return parts.map((part, index) => {
    const maybeLineBreak = index < lastIndex ? <br /> : '';
    return (
      <span>
        {part.replace(/ /g, '\u00a0')}
        {maybeLineBreak}
      </span>
    );
  });
}

function isAType(token) {
  if (['{', '}', ':', '->', '|', '(', ')', '?', '\n'].includes(token)) {
    return false;
  }
  if (['number', 'appendable', 'comparable'].includes(token)) {
    // compappend?
    return true;
  }
  return token.length > 0 && token[0] === token[0].toUpperCase();
}
