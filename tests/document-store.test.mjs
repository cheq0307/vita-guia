import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {DocumentStore} from '../db/document-store.ts';
function setup(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON');
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 const db={prepare(sql){const s=sqlite.prepare(sql);let args=[];const bound={bind(...a){args=a;return bound},async first(){return s.get(...args)??null},async all(){return {results:s.all(...args)}},async run(){const r=s.run(...args);return{meta:{changes:Number(r.changes)}}}};return bound}};
 return {store:new DocumentStore(db),sqlite};
}
test('quota reserves unique files once and does not permit overcommit',async()=>{
 const {store,sqlite}=setup();try{
  const a=await store.reserveFile('a'.repeat(64),200000000,'application/pdf');
  assert.ok(a);assert.equal((await store.reserveFile('a'.repeat(64),200000000,'application/pdf')).id,a.id);
  assert.ok(await store.reserveFile('b'.repeat(64),200000000,'application/pdf'));
  assert.equal(await store.reserveFile('c'.repeat(64),200000000,'application/pdf'),null);
  assert.equal(await store.usedBytes(),400000000);
 }finally{sqlite.close()}
});
test('finalization and cancellation cannot both win and release reserved quota',async()=>{
 const {store,sqlite}=setup();try{
  const f=await store.reserveFile('f'.repeat(64),100,'application/pdf');await store.setUpload(f.id,'upload-one');
  assert.equal((await store.claimCompletion(f.id)).upload_id,'finalizing:upload-one');
  assert.equal(await store.cancelFile(f.id),false);assert.equal(await store.usedBytes(),100);
  await store.markReady(f.id);assert.equal((await store.file(f.id)).state,'ready');
  const g=await store.reserveFile('g'.repeat(64),200,'application/pdf');await store.setUpload(g.id,'upload-two');
  assert.equal((await store.claimCancellation(g.id)).upload_id,'cancelling:upload-two');
  assert.equal(await store.usedBytes(),300,'Space stays reserved while R2 abort is unconfirmed');
  assert.equal((await store.claimCompletion(g.id)).upload_id,'cancelling:upload-two');
  assert.equal((await store.claimCancellation(g.id)).upload_id,'cancelling:upload-two','Interrupted abort can be retried');
  assert.equal(await store.cancelFile(g.id),true);assert.equal((await store.claimCompletion(g.id)).state,'cancelled');
  await store.markReady(g.id);assert.equal((await store.file(g.id)).state,'cancelled');assert.equal(await store.usedBytes(),100);
 }finally{sqlite.close()}
});
test('new versions remain private and preserve the approved version and historical source links',async()=>{
 const {store,sqlite}=setup();try{
  const d=await store.createDocument('Catálogo','catalog','clients');
  const f=await store.reserveFile('d'.repeat(64),100,'application/pdf');await store.markReady(f.id);
  const v=await store.createVersion(d.id,f.id,'catalogo.pdf');
  assert.equal(await store.canRead(v.id,'client'),false);
  await store.approve(d.id,v.id);assert.equal(await store.canRead(v.id,'client'),false);assert.equal(await store.canRead(v.id,'advisor'),true);
  const f2=await store.reserveFile('e'.repeat(64),200,'application/pdf');await store.markReady(f2.id);
  const v2=await store.createVersion(d.id,f2.id,'catalogo-nuevo.pdf');
  assert.equal(await store.canRead(v2.id,'client'),false);assert.equal(await store.canRead(v.id,'advisor'),true);
  await store.approve(d.id,v2.id);assert.equal(await store.canRead(v.id,'client'),false);
  assert.equal(await store.canRead(v.id,'admin'),true);
  await store.updateDocument(d.id,{title:'Catálogo',category:'catalog',audience:'internal',status:'current'});
  assert.equal(await store.canRead(v2.id,'advisor'),false);
 }finally{sqlite.close()}
});
