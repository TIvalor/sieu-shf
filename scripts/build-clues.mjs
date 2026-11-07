import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const root=new URL('../data/',import.meta.url);
const raw=JSON.parse(await readFile(new URL('clues-raw.json',root),'utf8'));
const source='https://gobi.salud.gob.mx/historico_clues/ESTABLECIMIENTO_SALUD_202609.xlsx?v=1.1';
const groups=new Map(),seen=new Set();let discarded=0;
for(const r of raw){
 const [id,name,institution,la,lo,lv,ty,status,typology,address,entity]=r;
 const lat=Number(la),lon=Number(lo),level=Number(lv),type=Number(ty);
 if(!la?.trim()||!lo?.trim()||!Number.isFinite(lat)||!Number.isFinite(lon)||lat<14||lat>33||lon< -119||lon> -86||Number(status)!==1||![1,2].includes(type)||!id||!name||seen.has(id)){discarded++;continue;}
 seen.add(id);const code=String(entity).padStart(2,'0');if(!groups.has(code))groups.set(code,[]);
 groups.get(code).push([id,name,institution,lat,lon,[1,2,3].includes(level)?level:null,type,typology,address]);
}
await mkdir(root,{recursive:true});
const manifest={schemaVersion:1,cutoff:'2026-09',source,downloadPage:'https://gobi.salud.gob.mx/Bases_Clues.html',builtAt:new Date().toISOString(),columns:['clues','name','institution','lat','lon','level','type','typology','address'],filters:'Estatus EN OPERACION; consulta externa u hospitalización; coordenadas dentro de México. Nivel sin especificar no se infiere.',rawCount:raw.length,discarded,total:seen.size,shards:[]};
for(const [code,rows] of [...groups].sort()){
 const file='clues-202609-'+code+'.json.gz',bytes=gzipSync(JSON.stringify(rows),{level:9,mtime:0});await writeFile(new URL(file,root),bytes);
 manifest.shards.push({file,count:rows.length,sha256:createHash('sha256').update(bytes).digest('hex'),bounds:[Math.min(...rows.map(r=>r[3])),Math.min(...rows.map(r=>r[4])),Math.max(...rows.map(r=>r[3])),Math.max(...rows.map(r=>r[4]))]});
}
await writeFile(new URL('clues-manifest.json',root),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({raw:raw.length,eligible:seen.size,discarded,shards:groups.size}));
