import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import * as policy from '../app/videos/policy.ts';
import {VideoStore} from '../db/video-store.ts';
import {DocumentStore} from '../db/document-store.ts';
import {uploadVideoParts} from '../app/videos/upload-client.ts';
function setup(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON');
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 const db={prepare(sql){const s=sqlite.prepare(sql);let args=[];const bound={bind(...a){args=a;return bound},async first(){return s.get(...args)??null},async all(){return {results:s.all(...args)}},async run(){const r=s.run(...args);return{meta:{changes:Number(r.changes)}}}};return bound}};
 return {store:new VideoStore(db),files:new DocumentStore(db),sqlite};
}
test('external video URLs accept HTTPS and reject executable, local and credentialed links',()=>{
 assert.equal(policy.externalVideoUrl(' https://www.youtube.com/watch?v=abc '),'https://www.youtube.com/watch?v=abc');
 for(const value of ['javascript:alert(1)','data:text/html,x','http://example.com/a','https://user:pass@example.com','https://localhost/a','https://127.0.0.1/a','nota'])assert.equal(policy.externalVideoUrl(value),null,value);
 assert.equal(policy.videoMime('clase.MP4'),'video/mp4');assert.equal(policy.videoMime('clase.webm'),'video/webm');assert.equal(policy.videoMime('clase.html'),null);
});
test('drafts and incomplete uploads are hidden; search, filters and publication work for both video kinds',async()=>{
 const {store,files,sqlite}=setup();try{
  const link=await store.create({title:'Preparación fácil',description:'Cómo preparar tu bebida.',kind:'link',url:'https://example.com/clase',fileId:null});
  assert.equal((await store.list(false)).total,0);
  await store.update(link.id,{title:link.title,description:link.description,url:link.url,status:'published'});
  assert.equal((await store.list(false,'preparacion','link')).total,1);
  assert.equal((await store.list(false,'','file')).total,0);
  const f=await files.reserveFile('a'.repeat(64),100,'video/mp4');
  const video=await store.create({title:'Rutina',description:'Una explicación en video.',kind:'file',url:null,fileId:f.id});
  assert.equal(await store.update(video.id,{title:video.title,description:video.description,url:null,status:'published'}),false);
  await files.markReady(f.id);
  assert.equal(await store.update(video.id,{title:video.title,description:video.description,url:null,status:'published'}),true);
  assert.equal((await store.list(false)).total,2);
  await store.update(link.id,{title:link.title,description:link.description,url:link.url,status:'archived'});
  assert.equal((await store.list(false)).total,1);assert.equal((await store.list(true)).total,2);
  assert.equal((await store.list(false,'zzz')).total,0);
  assert.equal((await store.list(false,'','file',999)).page,1);
  assert.equal(await files.usedBytes(),100,'Videos share the existing free storage allowance');
 }finally{sqlite.close()}
});
test('concurrent starts for one file reuse a single video record',async()=>{
 const {store,files,sqlite}=setup();try{
  const file=await files.reserveFile('b'.repeat(64),100,'video/mp4');const input={title:'Video',description:'Descripción',kind:'file',url:null,fileId:file.id};
  const results=await Promise.all([store.create(input),store.create(input)]);assert.equal(results[0].id,results[1].id);
 }finally{sqlite.close()}
});
test('pausing while the last part uploads cannot finalize or publish',async()=>{
 let paused=false;let sent=0;const file=new File(['small video'],'small.mp4');
 const result=await uploadVideoParts(file,{fileId:'test',partSize:100,parts:[]},()=>{},()=>paused,async()=>{sent++;paused=true});
 assert.equal(sent,1);assert.equal(result,'paused');
});
