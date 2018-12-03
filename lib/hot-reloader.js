'use babel';

import elmHot from 'elm-hot';
import express from 'express';
import expressWs from 'express-ws';
import chokidar from 'chokidar';
import untildify from 'untildify';
import path from 'path';
import fs from 'fs';

export default class HotReloader {
  constructor() {
    app = express();
    expressWs(app);

    this.server = null;
    this.fileWatcher = null;
    this.subscribers = {};

    const hotReloadingCode = fs.readFileSync(
      path.join(__dirname, 'hot-reloading-client.js'),
      { encoding: 'utf8' }
    );

    app.get('/build', (req, res) => {
      const filePath = untildify(decodeURI(req.query.path));
      let fileContents = null;
      try {
        fileContents = fs.readFileSync(filePath);
      } catch (err) {}
      if (fileContents) {
        const hotReloadingHost = atom.config.get('elmjutsu.hotReloadingHost');
        res.send(
          hotReloadingCode
            .replace('HOST', hotReloadingHost)
            .replace('PORT', this.server.address().port)
            .replace('FILE_PATH', filePath) +
            '\n' +
            elmHot.inject(fileContents)
        );
      } else {
        res.sendStatus(404);
      }
    });

    app.ws('/ws', (ws, _req) => {
      ws.on('message', data => {
        const message = JSON.parse(data);
        if (message.type === 'startWatchRequested') {
          const filePath = message.filePath;
          if (!this.fileWatcher) {
            this.fileWatcher = chokidar.watch(filePath, {
              persistent: true,
            });
            this.fileWatcher.on('change', changedFilePath => {
              if (this.subscribers[changedFilePath]) {
                for (let subscriberWs of this.subscribers[
                  changedFilePath
                ].values()) {
                  sendModifiedFile(changedFilePath, subscriberWs);
                }
              }
            });
          }

          if (!this.subscribers[filePath]) {
            this.fileWatcher.add(filePath);
            this.subscribers[filePath] = new Set([ws]);
          } else {
            this.subscribers[filePath] = this.subscribers[filePath].add(ws);
          }

          ws['filePath'] = filePath;
        }
      });
      ws.on('close', () => {
        if (ws['filePath']) {
          const filePath = ws['filePath'];
          if (this.subscribers[filePath]) {
            const subs = this.subscribers[filePath];
            subs.delete(ws);
            this.subscribers[filePath] = subs;
            if (this.subscribers[filePath].size === 0) {
              this.fileWatcher.unwatch(filePath);
              delete this.subscribers[filePath];
            }
          }
        }
      });
    });

    app.on('error', err => {
      atom.notifications.addError(`Error starting hot reloader`, {
        detail: `${err.message} (${err.code})`,
        dismissable: true,
      });
    });

    atom.config.observe('elmjutsu.hotReloadingEnabled', enabled => {
      if (enabled) {
        const port = atom.config.get('elmjutsu.hotReloadingPort');
        this.startServer(port);
      } else {
        this.stopServer();
      }
    });
  }

  startServer(hotReloadingPort) {
    this.server = app.listen(hotReloadingPort, () => {
      const hotReloadingHost = atom.config.get('elmjutsu.hotReloadingHost');
      atom.notifications.addInfo(`Started Elmjutsu hot reloader`, {
        detail:
          'You can add the following to your HTML file:\n<script src="http://' +
          hotReloadingHost +
          ':' +
          this.server.address().port +
          '/build?path=PATH_TO_JS_FILE"></script>',
        dismissable: true,
      });
    });
  }

  stopServer() {
    if (this.server) {
      this.server.close();
      this.server = null;
      atom.notifications.addInfo(`Stopped Elmjutsu hot reloader`, {
        dismissable: true,
      });
    }
  }

  destroy() {
    this.stopServer();
    if (this.fileWatcher) {
      this.fileWatcher.close();
    }
    this.fileWatcher = null;
    this.subscribers = null;
  }
}

function sendModifiedFile(filePath, ws) {
  const fileContents = fs.readFileSync(filePath, {
    encoding: 'utf8',
  });
  if (fileContents.endsWith('(this));')) {
    // If we got the complete file, send the modified contents.
    const modifiedContents = elmHot.inject(fileContents);
    ws.send(
      JSON.stringify({
        type: 'fileChanged',
        contents: modifiedContents,
      })
    );
  } else {
    // Else, try again after a few milliseconds.
    setTimeout(() => {
      sendModifiedFile(filePath, ws);
    }, 100);
  }
}
