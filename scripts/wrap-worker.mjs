import { rename, writeFile } from 'node:fs/promises';

await rename('dist/server/index.js', 'dist/server/app.js');
await writeFile(
  'dist/server/index.js',
  `import handleRequest from './app.js';\n\nexport default {\n  fetch(request, env, ctx) {\n    return handleRequest(request, env, ctx);\n  },\n};\n`,
);
