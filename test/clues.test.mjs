import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {selectClues,createCluesClient,intersects} from '../clues.mjs';
import {blank,CATALOG,result,importRecords,report} from '../core.mjs';
const point={lat:19.4326,lon:-99.1332};
const metadata={cutoff:'2026-09',source:'https://gobi.salud.gob.mx/catalogo.xlsx',downloadPage:'https://gobi.salud.gob.mx/Bases_Clues.html'};
const row=(id,m,level=1,type=1)=>[id,'Unidad FICTICIA '+id,'INSTITUCIÓN FICTICIA',point.lat+m/111195.08,point.lon,level,type,'TIPO FICTICIO','DOMICILIO FICTICIO'];
test('CLUES ordena las tres más cercanas por nivel; ampliación hasta veinte y radio exacto',()=>{
 const rows=[500,100,300,200,2500].map((m,i)=>row('A'+i,m));rows.push(row('nivel2',10,2),row('nivel3',20,3),row('sin-nivel',5,null));
 assert.deepEqual(selectClues(rows,point,'salud1',{metadata}).records.map(r=>r.provenance.clues),['A1','A3','A2']);
 assert.equal(selectClues(rows,point,'salud1',{metadata,limit:20}).records.length,4);
 assert.equal(selectClues(rows,point,'salud2',{metadata}).records[0].provenance.healthLevel,2);
 assert.equal(selectClues(rows,point,'salud3',{metadata}).records[0].provenance.healthLevel,3);
});
test('Hospital usa tipo oficial de hospitalización; no infiere nivel por nombre',()=>{
 const rows=[row('externa',0,1,1),row('hospital',100,null,2)];
 assert.equal(selectClues(rows,point,'hospital',{metadata}).records.length,1);
 assert.equal(selectClues(rows,point,'salud3',{metadata}).records.length,0);
});
test('CLUES no verifica presencia ni ausencia; conserva procedencia en JSON e importación',()=>{
 const s=blank();s.records=importRecords(selectClues([row('A',100)],point,'salud1',{metadata}).records);
 assert.equal(s.records[0].verified,false);assert.equal(s.records[0].provenance.clues,'A');
 assert.equal(result(s,CATALOG.find(c=>c.id==='salud1')).status,'pendiente_verificacion');
 assert.equal(report(s).records[0].provenance.catalogCutoff,'2026-09');
 assert.equal(result(s,CATALOG.find(c=>c.id==='salud3')).status,'no_localizado');assert.equal(s.absences.length,0);
});
test('Carga todas las entidades limítrofes; comprueba integridad y comparte caché',async()=>{
 const bytes=gzipSync(JSON.stringify([row('A',100)]));const shard={file:'clues-202609-01.json.gz',count:1,bounds:[19,-100,20,-99],sha256:createHash('sha256').update(bytes).digest('hex')};let requests=0;
 const client=createCluesClient(async url=>{requests++;return String(url).endsWith('json')?Response.json({...metadata,schemaVersion:1,shards:[shard]}):new Response(bytes);},new URL('https://example.test/data/'));
 assert.equal((await client.query(point,'salud1')).records.length,1);await client.query(point,'hospital');assert.equal(requests,2);
 assert.equal(intersects({bounds:[19.44,-100,20,-99]},point),true);
 const broken=createCluesClient(async url=>String(url).endsWith('json')?Response.json({...metadata,schemaVersion:1,shards:[{...shard,sha256:'incorrecto'}]}):new Response(bytes),new URL('https://example.test/data/'));
 await assert.rejects(broken.query(point,'salud1'),/Integridad/);
});
test('Una descarga parcial falla explícitamente y no produce una búsqueda vacía',async()=>{
 const shard={file:'clues-202609-01.json.gz',count:1,bounds:[19,-100,20,-99]};
 const client=createCluesClient(async url=>String(url).endsWith('json')?Response.json({...metadata,schemaVersion:1,shards:[shard]}):new Response('',{status:404}),new URL('https://example.test/data/'));
 await assert.rejects(client.query(point,'salud1'),/No se concluye ausencia/);
});
test('Catálogo nacional real: 32 entidades, sumas y hashes correctos; cada registro cumple filtros',async()=>{
 const m=JSON.parse(await readFile(new URL('../data/clues-manifest.json',import.meta.url)));let total=0;const seen=new Set();
 assert.equal(m.shards.length,32);assert.equal(m.rawCount,m.total+m.discarded);
 for(const shard of m.shards){const bytes=await readFile(new URL('../data/'+shard.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),shard.sha256);const rows=JSON.parse(gunzipSync(bytes));assert.equal(rows.length,shard.count);total+=rows.length;for(const r of rows){assert.ok(!seen.has(r[0]));seen.add(r[0]);assert.ok([1,2].includes(r[6]));assert.ok(r[5]===null||[1,2,3].includes(r[5]));assert.ok(r[3]>=14&&r[3]<=33&&r[4]>=-119&&r[4]<=-86);}}
 assert.equal(total,m.total);assert.ok(total>30000);
});
