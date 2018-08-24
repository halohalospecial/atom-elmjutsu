'use babel';

import * as React from 'react';

export default {
  formatMessage(message) {
    const partViews = message.map(formatPart);
    return (
      <div>
        <div className="elmjutsu-problem">{partViews}</div>
      </div>
    );
  }
};

function formatPart(part) {
  if (typeof part === 'string') {
    return <span>{formatText(part)}</span>;
  } else {
    return (
      <span className={'elmjutsu-color-' + part.color}>
        {formatChunk(part)}
      </span>
    );
  }
}

function formatChunk(chunk) {
  const children = formatText(chunk.string);
  if (chunk.bold && chunk.underline) {
    return (
      <b>
        <u>{children}</u>
      </b>
    );
  } else if (chunk.bold) {
    return <b>{children}</b>;
  } else if (chunk.underline) {
    return <u>{children}</u>;
  } else {
    return children;
  }
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
