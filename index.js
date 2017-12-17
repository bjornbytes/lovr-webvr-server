const path = require('path');
const { exec } = require('child_process');
const { watch } = require('chokidar');
const WebSocket = require('ws');
const express = require('express');
const opn = require('opn');
const argv = require('yargs-parser')(process.argv.slice(2), {
  boolean: ['open'],
  default: { open: true }
});

if (argv._.length < 1) {
  console.error('usage: lovr-webvr-server [--port <port>] project');
  process.exit(1);
}

const source = argv._[0];
const project = path.basename(path.resolve(source));
const port = argv.port || 8080;
const open = argv.open;

let updated = false;

const compile = (req, res, next) => {
  if (updated) return next();

  updated = true;

  const filePackager = path.join(__dirname, 'emscripten/tools/file_packager.py');
  const dataOutput = path.join(__dirname, 'build', `${project}.data`);
  const preload = path.resolve(source);
  const jsOutput = path.join(__dirname, 'build', `${project}.js`);

  const command = [
    'python',
    `"${filePackager}"`,
    `"${dataOutput}"`,
    `--preload "${preload}"@/`,
    `--js-output="${jsOutput}"`
  ].join(' ');

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      updated = false;
      return next();
    }

    compile(req, res, next)
  });
};

const refresh = () => {
  connections.forEach(connection => {
    if (connection.readyState === WebSocket.OPEN) {
      connection.send('refresh');
    }
  });
};

watch(source).on('all', () => {
  if (updated) {
    updated = false;
    compile(null, null, refresh);
  }
});

const socketServer = new WebSocket.Server({ port: 8081 });
let connections = [];
socketServer.on('connection', connection => {
  connections.push(connection);
  connection.on('close', () => connections.splice(connections.indexOf(connection)));
});

express().
  set('view engine', 'ejs').
  set('views', path.join(__dirname, './views')).
  use(express.static(path.join(__dirname, 'build'))).
  get('/', compile, (req, res) => res.render('index', { project })).
  listen(port, function() {
    const address = this.address();
    console.log(`Listening on ${address.port}`);
    open && opn(`http://localhost:${address.port}`);
  });
