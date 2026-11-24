import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const [directory,version]=process.argv.slice(2);
if(!directory || !/^[a-f0-9]{7,40}$/.test(version||''))throw Error('Expected public directory and commit SHA');
for(const name of readdirSync(directory)){
  if(!/\.(html|js|css)$/.test(name))continue;
  const path=join(directory,name);
  writeFileSync(path,readFileSync(path,'utf8').replace(/(\.\/[\w./-]+\.(?:js|css))(?:\?v=[a-f0-9]+)?(?=["'])/g,`$1?v=${version}`));
}
console.log('Versioned public assets and module imports.');