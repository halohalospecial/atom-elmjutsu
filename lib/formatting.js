'use babel';

import * as React from 'react';

export default {
  formatMessage(message, messagesEnhanced) {
    const partViews = message.map(partView => {
      return formatPart(partView, messagesEnhanced);
    });
    return (
      <div>
        <div className="elmjutsu-problem">{partViews}</div>
      </div>
    );
  },
};

function formatPart(part, messagesEnhanced) {
  if (typeof part === 'string') {
    return <span>{formatText(part, messagesEnhanced)}</span>;
  } else {
    return (
      <span className={'elmjutsu-color-' + part.color}>
        {formatChunk(part, messagesEnhanced)}
      </span>
    );
  }
}

function formatChunk(chunk, messagesEnhanced) {
  const children = formatText(chunk.string, messagesEnhanced);
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

function formatText(text, messagesEnhanced) {
  if (text.length === 0) {
    return '';
  }
  // Check if text has URLs.
  if (messagesEnhanced && /<\n?h\n?t\n?t\n?p/.test(text)) {
    return formatTextWithUrl(text);
  }
  return formatTextParts(text);
}

function formatTextParts(text) {
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

function formatTextWithUrl(text) {
  // From https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url:
  const urlRegex = /<(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#()?&//=]*))>/g;
  const parts = text.split(urlRegex);
  if (parts.length >= 3) {
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return formatUrl(part);
      }
      return formatTextParts(part);
    });
  }
  return formatTextParts(text);
}

function formatUrl(text) {
  return <a href={text}>{formatTextParts(text)}</a>;
}
