import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const OUT='/private/tmp/claude-501/-Users-dmytro--superset-projects-hoba-work/5d5731b7-065e-4df0-896d-da78d15259f3/scratchpad/spec';
mkdirSync(OUT,{recursive:true});
const b=await chromium.launch();
for(const [scheme,tag] of [['dark','d'],['light','l']]){
  const ctx=await b.newContext({colorScheme:scheme,viewport:{width:1440,height:1200},deviceScaleFactor:1.5,locale:'uk-UA'});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/uk/artifacts/A-013',{waitUntil:'networkidle'});
  await p.screenshot({path:`${OUT}/a013-${tag}.png`,fullPage:true});
  await ctx.close();
}
await b.close();console.log('ok');
