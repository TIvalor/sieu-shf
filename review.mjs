import {CATALOG,result,rankedCandidates,distance} from './core.mjs';
export function quickReview(state,conceptId,{recordId,absent=false,reviewer,scope='',at=new Date().toISOString()}={}){
 const c=CATALOG.find(c=>c.id===conceptId);if(!c||!reviewer?.trim())throw Error('Indique el responsable una sola vez antes de validar.');
 let r;if(absent){if(!scope.trim())throw Error('Indique cómo comprobó la ausencia dentro del radio.');r={id:crypto.randomUUID(),concept:c.id,absent:true,source:'Comprobación del valuador',reference:'Declaración de ausencia: '+at,scope:scope.trim(),demo:state.demo===true};}
 else{r=state.records.find(x=>x.id===recordId&&x.concept===c.id);if(!r||distance(state.property,r)>c.radius)throw Error('Seleccione un candidato dentro del radio.');if(!r.source||!r.reference)throw Error('Falta la referencia del candidato.');}
 const before=structuredClone(r);for(const x of [...state.records,...state.absences])if(x.concept===c.id)x.verified=false;
 Object.assign(r,{verified:true,reviewer:reviewer.trim(),reviewedAt:at,scope:absent?r.scope:'Confirmación del valuador de ubicación, correspondencia y operación del candidato seleccionado.',consultedAt:r.consultedAt||at});if(absent)state.absences.push(r);
 state.audit.push({at,action:absent?'ausencia_confirmada_rapida':'candidato_validado_rapido',detail:{before,after:structuredClone(r)}});return r;
}
export function captureRows(state){return CATALOG.map(c=>{const r=result(state,c);return [c.label,r.status==='localizado_verificado'?'Existe':r.status==='ausencia_verificada'?'No existe':'',r.status==='localizado_verificado'?Math.round(r.distance):null];});}
export function detailRows(state){return CATALOG.map(c=>{const r=result(state,c),e=r.record;return[c.label,r.status,e?.name||'',e?.source||'',e?.reference||'',e?.reviewer||'',e?.reviewedAt||'',c.radius,state.demo||e?.demo?'FICTICIO':''];});}
