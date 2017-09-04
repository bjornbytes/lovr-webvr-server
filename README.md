lovr-webvr-server
===

A live reloading server for rapid prototyping of LÖVR WebVR projects.

Install
---

Clone the repo, then grab the submodules with `git submodule update --init`.

Usage
---

Run the server by passing a path to a LÖVR project:

```sh
node . path/to/project
```

A browser will be opened with the project, and will automatically reload whenver a Lua file is
changed.

Options
---

- `--port` The port to use for the web server.  The default is 8080.
- `--open`, `--no-open` Whether or not a browser window should be opened on startup.

License
---

MIT, see [`LICENSE`](LICENSE) for details.
