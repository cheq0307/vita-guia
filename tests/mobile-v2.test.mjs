import {test} from 'node:test';
import assert from 'node:assert/strict';
import {workspaceNavigation,workspaceBase} from '../app/ui/navigation.ts';
import {APP_VERSION} from '../app/version.ts';

test('v2 is distinguishable and workspace navigation never grants a user admin destinations',()=>{
 assert.equal(APP_VERSION,'2.0.0');
 assert.equal(workspaceBase(),'/admin');
 const nav=workspaceNavigation('private-token');
 assert.ok(nav.every(x=>x.href.startsWith('/asesor/private-token')));
 assert.ok(!nav.some(x=>/usuarios|revisar/i.test(x.label)));
 assert.ok(nav.some(x=>x.href.endsWith('/aportaciones')));
 assert.ok(nav.some(x=>x.href.endsWith('/documentos')));
 assert.ok(workspaceNavigation().some(x=>x.href==='/admin/aportaciones'));
});
