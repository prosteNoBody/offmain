offmain
===================================


About
-----

Build plugin which turns sequential JavaScript into parallel code for the browser. Code which should run in parallel is marked with directives written as comments and the plugin rewrites it to run in Web Workers.

This project is practical part of my master's thesis at the Faculty of Information Technology, Czech Technical University in Prague.


Installation
-----
Result of the build is a finished plugin, which you connect to the transpiler in the build of your application. The marked code is then rewritten every time the application is built.


Development
-----
You need Node.js 24.

- `npm install` - installs dependencies
- `npx playwright install chromium` - downloads browser for tests
- `npm run build` - builds plugin into `dist/`
- `npm test` - runs tests
- `npm run lint` - runs linter
- `npm run format` - formats code
- `npm run typecheck` - checks types


Project structure
-----
- `docs/architecture.md` - how the tool is structured and why
- `src/plugin/` - build plugin, runs in Node.js
- `src/runtime/` - runtime library, runs in the browser
- `tests/plugin/` - tests of plugin, run in Node.js
- `tests/runtime/` - tests of runtime library, run in a real browser
- `benchmarks/` - benchmark programs and measurement results


Use of AI tools
-----

This project is developed with the assistance of AI tools (Claude Code). How
they were used is described in the thesis.


License
-----

MIT, see [LICENSE](LICENSE).

<img src="https://fit.cvut.cz/static/images/fit-cvut-logo-en.svg" alt="FIT CTU logo" height="200">

This software was developed with the support of the **Faculty of Information Technology, Czech Technical University in Prague**.
For more information, visit [fit.cvut.cz](https://fit.cvut.cz).
