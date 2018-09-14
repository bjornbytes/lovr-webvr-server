const path = require('path');
const { exec } = require('child_process');
const { watch } = require('chokidar');
const WebSocket = require('ws');
const express = require('express');
const opn = require('opn');
const argv = require('yargs-parser')(process.argv.slice(2), {
  boolean: ['open'],
  string: ['lovr'],
  default: { open: true, lovr: 'https://lovr.org/static/js' }
});

if (argv._.length < 1) {
  console.error('usage: lovr-webvr-server [--port <port>] [--[no-]open] [--lovr <path>] project');
  return process.exit(1);
}

const source = argv._[0];
const project = path.basename(path.resolve(source));
const port = argv.port || 8080;
const open = argv.open;
const lovr = argv.lovr;

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
    '--no-heap-copy',
    `--preload "${preload}"@/`,
    `--js-output="${jsOutput}"`
  ].join(' ');

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      updated = false;
      return next();
    }

    compile(req, res, next);
  });
};

const refresh = () => {
  connections.forEach(connection => {
    if (connection.readyState === WebSocket.OPEN) {
      connection.send('refresh');
    }
  });
};

let ready = false;
watch(source).
  on('ready', () => ready = true).
  on('all', event => {
    if (ready && updated) {
      updated = false;
      compile(null, null, refresh);
    }
  });

const socketServer = new WebSocket.Server({ port: 8081 });
let connections = [];
socketServer.on('connection', connection => {
  connections.push(connection);
	connection.on('error', () => {});
  connection.on('close', () => connections.splice(connections.indexOf(connection)));
});

const isRemote = lovr.startsWith('http');
const base = isRemote ? lovr.replace(/\/+$/, '') : '';
const baseServe = isRemote ? function(req, res, next) { next(); } : express.static(path.resolve(lovr));

express().
  set('view engine', 'ejs').
  set('views', path.join(__dirname, './views')).
  get('/', compile, (req, res) => res.render('index', { project, base })).
  use(express.static(path.join(__dirname, 'build'))).
  use(baseServe).
  listen(port, function() {
    const address = this.address();
    console.log(`Listening on ${address.port}`);
    open && opn(`http://localhost:${address.port}`);
  });
