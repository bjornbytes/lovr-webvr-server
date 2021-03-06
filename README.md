lovr-webvr-server
===

A live-reloading server for rapid prototyping of [LÖVR](https://lovr.org) WebVR projects.

Install
---

Clone the repo, and then grab the submodules:

```sh
git clone git@github.com:bjornbytes/lovr-webvr-server.git
git submodule update --init
```

Also make sure you have Python 2 installed and available in your PATH.

Usage
---

Run the server by passing a path to a LÖVR project:

```sh
node . path/to/project
```

A browser will be opened with the project, and will automatically reload whenever a Lua file is
changed.

Options
---

- `--port <port>` The port to use for the web server.  The default is 8080.
- `--open`, `--no-open` Whether or not a browser window should be opened on startup.
- `--lovr <path>` A path to a folder that contains `lovr.js` and `lovr.wasm`, or a URL to use as the
  base path.  The default is `https://lovr.org/static/js`.  This lets you use different versions or
  builds of LÖVR.

License
---

MIT, see [`LICENSE`](LICENSE) for details.
