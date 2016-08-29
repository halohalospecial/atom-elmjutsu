'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import childProcess from 'child_process';
const _ = require('underscore-plus');
import ReplView from './repl-view';
import helper from './helper';

export default class Repl {

  constructor() {
    this.procs = {};
    this.views = {};
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if (uriToOpen.startsWith(getURIPrefix())) {
        const projectDirectory = uriToOpen.replace(getURIPrefix(), '');
        this.views[projectDirectory] = new ReplView();
        return this.views[projectDirectory];
      }
    }));
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
    _.values(this.views).forEach((view) => {
      view.destroy();
    });
    this.views = null;
  }

  show(projectDirectory) {
    atom.workspace.open(getURI(projectDirectory), {searchAllPanes: true, split: 'right'})
      .then((view) => {
        // // //
      });
  }

  // Command
  startRepl() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      const projectDirectory = helper.getProjectDirectory(editor.getPath());
      if (!this.procs[projectDirectory]) {
        this.show(projectDirectory);

        const proc = childProcess.spawn(atom.config.get('elmjutsu.elmReplExecPath'), ['--interpreter', process.execPath], {
          cwd: projectDirectory
        });
        this.procs[projectDirectory] = proc;

        proc.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`); // // //
        });

        proc.stderr.on('data', (data) => {
          console.log(`stderr: ${data}`); // // //
        });

        proc.on('close', (code) => {
          console.log(`close: ${code}`); // // //
        });

        proc.on('error', (err) => {
          console.log(`error: ${err}`); // // //
        });

      } else {
        // A REPL for the `projectDirectory` already exists.
      }

    } else {
      // TODO: Spawn REPL in temporary directory.
    }
  }

  // Command
  stopRepl() {
    const editor = atom.workspace.getActiveTextEditor();
    const projectDirectory = helper.getProjectDirectory(editor.getPath());
    if (projectDirectory && this.procs[projectDirectory]) {
      this.procs[projectDirectory].kill();
    }
  }

}

function getURIPrefix() {
  return 'elmjutsu-repl-view://';
}

function getURI(projectDirectory) {
  return `${getURIPrefix()}${projectDirectory}/`;
}
