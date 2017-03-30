'use babel';

import {CompositeDisposable} from 'atom';
import path from 'path';
import fs from 'fs-extra';
import _ from 'underscore-plus';
import Queue from 'better-queue';
const atomLinter = require('atom-linter');
import SocketIO from 'socket.io';
import elmMakeHelper from './elm-make-helper';
import helper from './helper';

export default class LiveDebug {

  constructor() {
    this.projectMarkers = {};
    this.subscriptions = new CompositeDisposable();
    this.processMessageQueue = new Queue((message, callback) => {
      // setTimeout(() => {
        this.processMessage(message);
        callback();
      // }, 33);
    }, {
      // afterProcessDelay: 33,
      afterProcessDelay: 50,
      concurrent: 1
    });
    this.socketServer = new SocketIO();
    this.socketServer.on('connection', (client) => {
      helper.log('Socket client connected: ' + client.id);
      client.on('disconnect', () => {
        helper.log('Socket client disconnected: ' + client.id);
      });
      client.on('message', (message) => {
        const parts = message.split(':');
        if (parts[0] === ELMJUTSU_WATCH) {
          parts.shift();
          const filePath = parts.shift();
          const range = JSON.parse(parts.shift());
          const value = parts.join(':').slice(1);
          this.processMessageQueue.push({id: filePath + range, filePath, range, value});
        }
      });
    });
    this.socketServer.listen(this.getPort());
  }

  destroy() {
    this.socketServer.close();
    this.socketServer = null;
    this.destroyAllMarkers();
    this.subscriptions.dispose();
    this.subscriptions = null;
    this.processMessageQueue.destroy();
    this.processMessageQueue = null;
  }

  watchSelectionCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      const filePath = editor.getPath();
      const projectDirectory = helper.getProjectDirectory(filePath);
      // Mark selected ranges.
      editor.getSelectedBufferRanges().forEach((range) => {
        this.markWatchRange(range, filePath, projectDirectory, editor);
        // TODO: Remove all markers of editor when it's destroyed (editor.onDidDestroy).
      });
      // this.compileWithWatches(projectDirectory);
    }
  }

  markWatchRange(range, filePath, projectDirectory, editor) {
    let marker = editor.markBufferRange(range, {invalidate: 'never'});
    marker.setProperties({type: ELMJUTSU_WATCH, filePath, range});
    editor.decorateMarker(marker, {type: 'highlight', class: 'elmjutsu-watch-range'});
    // this.subscriptions.add(marker.onDidChange(() => {
    //   marker.destroy();
    //   this.removeMarker(projectDirectory, marker, editor);
    // }));
    this.subscriptions.add(marker.onDidDestroy(() => {
      this.removeMarker(projectDirectory, marker, editor);
    }));
    if (!this.projectMarkers[projectDirectory]) {
      this.projectMarkers[projectDirectory] = [marker];
    } else {
      this.projectMarkers[projectDirectory].push(marker);
    }
  }

  processMessage({filePath, range, value}) {
    const editor = this.getEditorByPath(filePath);
    if (editor.findMarkers({type: ELMJUTSU_WATCH, filePath, range}).length > 0) {
      // Destroy previous marker, if any.
      this.destroyWatchValueMarker(editor, filePath, range);
      let element = document.createElement('div');
      element.classList.add('elmjutsu-watch-value');
      // element.innerHTML = hint.html;
      element.textContent = value;
      // TODO: Look for a precise way to align the watch value.
      const charSize = (atom.config.get('editor.fontSize') || 14) / 2;
      element.style.paddingLeft = (range[0][1] * charSize) + 'px';
      let marker = editor.markBufferPosition([range[1][0], range[0][1]]);
      marker.setProperties({type: ELMJUTSU_WATCH_VALUE, filePath, range});
      editor.decorateMarker(marker, {type: 'block', position: 'after', item: element});
    }
  }

  destroyWatchValueMarker(editor, filePath, range) {
    editor.findMarkers({type: ELMJUTSU_WATCH_VALUE, filePath, range}).forEach((marker) => {
      marker.destroy();
    });
  }

  compileWithWatchesCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      const projectDirectory = helper.getProjectDirectory(editor.getPath());
      this.compileWithWatches(projectDirectory);
    }
  }

  compileWithWatches(projectDirectory) {
    const markers = this.projectMarkers[projectDirectory];
    if (!markers) {
      helper.notifyError('No watches found for project');
      return;
    }
    // atom.notifications.addInfo('Compiling with watches...');
    // setTimeout(() => {
      const outputFilePath = 'index.html'; // // //
      const executablePath = atom.config.get('elmjutsu.elmMakeExecPath');
      const inputFilePaths = _.uniq(markers.map((marker) => { return marker.getProperties().filePath; }));
      const inputFiles = inputFilePaths.map((filePath) => {
        // TODO: What if editor does not exist?
        const editor = this.getEditorByPath(filePath);
        const ranges = this.getMarkedRanges(editor);
        let code = null;
        helper.doInTempEditor((tempEditor) => {
          tempEditor.setText(editor.getText());
          tempEditor.setSelectedBufferRanges(ranges);
          tempEditor.mutateSelectedText((selection) => {
            const range = selection.getBufferRange();
            selection.insertText('(' + selection.getText() + ' |> Debug.log "' + ELMJUTSU_WATCH +
              ':' + filePath + ':[[' + range.start.row + ',' + range.start.column + '],[' + range.end.row + ',' + range.end.column + ']]")');
          });
          code = tempEditor.getText();
        });
        // console.log('code', code);
        return {
          name: path.basename(filePath),
          contents: code
        };
      });
      atomLinter.tempFiles(inputFiles, (tempFilePaths) => {
        // const args = tempFilePaths.concat(['--debug', '--yes', '--report=json', '--output=' + outputFilePath]);
        const args = tempFilePaths.concat(['--yes', '--report=json', '--output=' + outputFilePath]);
        return atomLinter.exec(executablePath, args, {
          stream: 'both', // stdout and stderr
          cwd: projectDirectory,
          env: process.env
        })
        .then(data => {
          const problems = elmMakeHelper.parseProblems(data, projectDirectory);
          // console.log('problems', problems);
          const [numErrors, numWarnings] = elmMakeHelper.getErrorsAndWarnings(problems).map((p) => { return p.length; });
          if (numErrors === 0) {
            fs.readFile(outputFilePath, (err, data) => {
              if (err) {
                helper.notifyError('Error reading from `${outputFilePath}`', err);
              } else {
                const text = data.toString();
                const serverAddress = 'http://' + this.getAddress() + ':' + this.getPort();
                const logString = `console.log(msg);`;
                const globalElmString = `var globalElm = this['Elm'];`;
                const updatedText =
                  text
                  .replace(new RegExp(_.escapeRegExp(logString), 'g'),
    `if (msg.startsWith('${ELMJUTSU_WATCH}:')) {
      if (self.elmjutsuClient) {
        self.elmjutsuClient.emit('message', msg);
      }
    } else {
      ${logString}
    }`)
                  .replace(globalElmString,
`${globalElmString}
var socketScript = document.createElement('script');
socketScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.slim.min.js';
var self = this;
socketScript.onload = function () {
  self.elmjutsuClient = io('${serverAddress}');
  self.elmjutsuClient.on('connect', function() {
    console.log('Connected to Elmjutsu.');
  });
  self.elmjutsuClient.on('message', function(message) {
    switch (message.type) {
      case 'reload':
        window.location.reload();
        break;
    }
  });
  self.elmjutsuClient.on('disconnect', function() {
    console.log('Disconnected from Elmjutsu.');
  });
};
document.head.appendChild(socketScript);`);
                  fs.writeFile(outputFilePath, updatedText, (err) => {
                    if (err) {
                      helper.notifyError('Error writing to `${outputFilePath}`', err);
                    } else {
                      atom.notifications.addSuccess('Compiled with watches', {
                        detail: 'Output = ' + outputFilePath
                      });
                      this.socketServer.sockets.emit('message', {type: 'reload'});
                    }
                  });
              }
            });
          } else {
            helper.notifyError('Failed to add watch', 'Errors: ' + numErrors);
          }
        })
        .catch(errorMessage => {
          helper.notifyError('Failed to add watch', errorMessage);
        });
      });
    // }, 0);
  }

  getMarkedRanges(editor) {
    return editor.findMarkers({type: ELMJUTSU_WATCH}).map((marker) => {
      return marker.getProperties().range;
    });
  }

  getEditorByPath(filePath) {
    return _.find(atom.workspace.getTextEditors(), (editor) => { return filePath === editor.getPath(); });
  }

  unwatchSelectionCommand() {
    // TODO
  }

  unwatchAllCommand() {
    this.destroyAllMarkers();
  }

  destroyAllMarkers() {
    _.flatten(_.values(this.projectMarkers), true).forEach((marker) => {
      marker.destroy();
    });
    this.projectMarkers = {};
  }

  removeMarker(projectDirectory, marker, editor) {
    // Destroy associated watch value marker.
    const {filePath, range} = marker.getProperties();
    this.destroyWatchValueMarker(editor, filePath, range);
    const markers = this.projectMarkers[projectDirectory];
    if (markers) {
      const markerIndex = markers.indexOf(marker);
      if(markerIndex != -1) {
        this.projectMarkers[projectDirectory].splice(markerIndex, 1);
      }
    }
  }

  getAddress() {
    return atom.config.get('elmjutsu.liveDebugAddress') || 'localhost';
  }

  getPort() {
    return atom.config.get('elmjutsu.liveDebugPort') || 8000;
  }
}

const ELMJUTSU_WATCH = 'elmjutsuWatch';
const ELMJUTSU_WATCH_VALUE = 'elmjutsuWatchValue';
