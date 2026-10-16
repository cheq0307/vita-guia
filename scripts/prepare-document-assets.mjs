import {mkdir,copyFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
await mkdir(new URL('public/vendor/',root),{recursive:true});
await copyFile(new URL('node_modules/pdfjs-dist/build/pdf.worker.min.mjs',root),new URL('public/vendor/pdf.worker.min.mjs',root));
await copyFile(new URL('node_modules/pdfjs-dist/LICENSE',root),new URL('public/vendor/pdfjs-LICENSE',root));
