// (function() {

// if (typeof module === "object")
// {
//   module['exports'] = Elm;
//   return;
// }

// var globalElm = this['Elm'];
// if (typeof globalElm === "undefined")
// {
//   this['Elm'] = Elm;
//   return;
// }

// for (var publicModule in Elm)
// {
//   if (publicModule in globalElm)
//   {
//     throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
//   }
//   globalElm[publicModule] = Elm[publicModule];
// }

// }).call(this);

////////////////////////////////////////////////////////////////////////////////

const indexer = Elm.Indexer.worker();

process.on('message', ({ type, data }) => {
  if (type === 'exit') {
    process.exit(0);

  } else if (type === 'start') {
    indexer.ports.configChangedSub.send(data.config);
    data.cmds.forEach(message => {
      indexer.ports[message + 'Cmd'].subscribe(data => {
        process.send({ type: message, data });
      });
    });
  } else {
    indexer.ports[type + 'Sub'].send(data);
  }
});

// Avoid exiting.
setInterval(function() {}, 1000 * 60 * 60); // 1 hour interval



