function connectToElmjutsu() {
  var ws = new WebSocket("ws://HOST:PORT/ws");
  ws.onopen = function() {
    console.log("Connected to Elmjutsu.");
    ws.send(
      JSON.stringify({
        type: "startWatchRequested",
        filePath: "FILE_PATH"
      })
    );
  };
  ws.onclose = function() {
    console.log("Disconnected from Elmjutsu.");
  };
  ws.onerror = function(evt) {
    console.log("Elmjutsu connection error: " + evt.data);
  };
  ws.onmessage = function(evt) {
    const message = JSON.parse(evt.data);
    if (message.type === "fileChanged") {
      module.hot.apply();
      delete Elm;
      evalElm(message.contents);
    }
  };
}

function evalElm(code) {
  if (!window["Elm"]) {
    eval(code);
  } else {
    setTimeout(function() {
      evalElm(code);
    }, 33);
  }
}

var hotDisposeCallback = null;
var module = {
  hot: {
    accept: function() {},
    dispose: function(callback) {
      hotDisposeCallback = callback;
    },
    data: null,
    apply: function() {
      var newData = {};
      hotDisposeCallback(newData);
      module.hot.data = newData;
    }
  }
};

connectToElmjutsu();
