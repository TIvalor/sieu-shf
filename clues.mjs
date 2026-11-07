import {CATALOG,coords,distance} from './core.mjs';
export const HEALTH_CONCEPTS=['salud1','salud2','salud3','hospital'];
export function selectClues(rows,point,conceptId,{limit=3,metadata}={}){
 coords(point);if(!HEALTH_CONCEPTS.includes(conceptId)||![3,20].includes(limit))throw Error('Consulta CLUES inválida.');
 const concept=CATALOG.find(c=>c.id===conceptId),level=Number(conceptId.slice(-1)),at=new Date().toISOString(),seen=new Set();
 const records=[];
 for(const r of rows){const [id,name,institution,lat,lon,declaredLevel,type,typology,address]=r;
  if(seen.has(id)||(conceptId==='hospital'?type!==2:declaredLevel!==level))continue;
  try{coords({lat,lon});}catch{continue;}if(distance(point,{lat,lon})>concept.radius)continue;seen.add(id);
  const provenance={clues:id,institution,healthLevel:declaredLevel,establishmentType:type,typology,address,operationStatus:'EN OPERACION (según catálogo)',catalogCutoff:metadata.cutoff,catalogUrl:metadata.source};
  records.push({concept:conceptId,name,lat,lon,source:'Secretaría de Salud · CLUES',reference:'CLUES: '+id+'; corte '+metadata.cutoff+'; '+metadata.downloadPage,activity:institution+' · '+typology+' · Nivel declarado: '+(declaredLevel??'no especificado'),consultedAt:at,provenance,verified:false});
 }
 records.sort((a,b)=>distance(point,a)-distance(point,b)||a.reference.localeCompare(b.reference));
 return {records:records.slice(0,limit),withinRadius:records.length,limit,radius:concept.radius,consultedAt:at,catalogCutoff:metadata.cutoff,source:metadata.source,warning:'Catálogo fechado; ubicación, nivel de atención, correspondencia y operación requieren revisión humana. No localizado no significa inexistencia.'};
}
export function intersects(shard,point,radius=2000){
 const dy=radius/110000,dx=dy/Math.max(.01,Math.cos(point.lat*Math.PI/180));const [south,west,north,east]=shard.bounds;
 return point.lat+dy>=south&&point.lat-dy<=north&&point.lon+dx>=west&&point.lon-dx<=east;
}
export function createCluesClient(fetcher=fetch,base=new URL('./data/',import.meta.url)){
 let manifestPromise;const cache=new Map();
 async function metadata(){if(!manifestPromise)manifestPromise=(async()=>{const r=await fetcher(new URL('clues-manifest.json',base));if(!r.ok)throw Error('No se pudo cargar el catálogo CLUES. No se concluye ausencia.');const m=await r.json();if(m.schemaVersion!==1||!Array.isArray(m.shards)||!m.shards.length)throw Error('Catálogo CLUES inválido.');return m;})().catch(e=>{manifestPromise=null;throw e;});return manifestPromise;}
 async function load(shard){if(!cache.has(shard.file))cache.set(shard.file,(async()=>{if(!/^clues-\d{6}-\d{2}\.json\.gz$/.test(shard.file))throw Error('Archivo CLUES inválido.');const r=await fetcher(new URL(shard.file,base));if(!r.ok)throw Error('No se pudo cargar una parte de CLUES. No se concluye ausencia.');const bytes=await r.arrayBuffer();const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');if(digest!==shard.sha256)throw Error('Integridad del catálogo CLUES no válida.');const text=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();const rows=JSON.parse(text);if(!Array.isArray(rows)||rows.length!==shard.count)throw Error('Catálogo CLUES incompleto.');return rows;})().catch(e=>{cache.delete(shard.file);throw e;}));return cache.get(shard.file);}
 return {metadata,async query(point,concept,{limit=3}={}){coords(point);const m=await metadata();const rows=(await Promise.all(m.shards.filter(s=>intersects(s,point)).map(load))).flat();return selectClues(rows,point,concept,{limit,metadata:m});}};
}
