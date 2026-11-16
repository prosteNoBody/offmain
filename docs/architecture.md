Architecture
===================================

This document is short on purpose. For now it describes only the basic concept and it will grow together with the tool.


Concept
-----
offmain is a plugin for a transpiler. Developer adds it into the build of an application, it does not run on its own.

Code which should run in parallel is marked with directives. Directives are written as comments, so the source with directives is still valid JavaScript. The idea is taken from OpenMP: code is written sequentially and the directives say what should run in parallel.

During the build the plugin finds the directives and rewrites the marked code to run in Web Workers. Workers are separate threads without shared memory, they communicate with the main thread only through messages.


Parts
-----
- plugin (`src/plugin/`) - runs during the build and rewrites the marked code
- runtime library (`src/runtime/`) - runs in the browser, contains code which is the same for every input, rewritten code is connected to it

Output of the plugin is ordinary JavaScript, which is processed by the rest of the build chain.
