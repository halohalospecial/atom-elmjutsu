'use babel';

export default {
  selector: '.source.elm',
  disableForSelector: '.string, .comment',
  inclusionPriority: 1,
  excludeLowerPriority: false,

  getSuggestions({editor, bufferPosition, scopeDescriptor}) {
    return [];
    // return new Promise(resolve => {
    //   const suggestion = {
    //     // text: '',
    //     snippet: 'div ${1:List (Html.Html msg)} ${2:Html.Html msg}',
    //     // displayText: '',
    //     // replacementPrefix: '',
    //     // type: 'function',
    //     leftLabel: '',
    //     leftLabelHTML: '',
    //     rightLabel: '',
    //     rightLabelHTML: '',
    //     className: '',
    //     iconHTML: '',
    //     description: '',
    //     descriptionMoreURL: ''
    //   };
    //   return resolve([suggestion]);
    // });
  }
};
