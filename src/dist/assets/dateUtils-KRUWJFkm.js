import{c as a}from"./index-BeMRu7EZ.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=a("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=a("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=a("ThumbsDown",[["path",{d:"M17 14V2",key:"8ymqnk"}],["path",{d:"M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z",key:"s6e0r"}]]);function u(n){const e=Math.floor((new Date().getTime()-n.getTime())/1e3);if(e<60)return`${e}s ago`;const t=Math.floor(e/60);if(t<60)return`${t}m ago`;const r=Math.floor(t/60);if(r<24)return`${r}h ago`;const o=Math.floor(r/24);if(o<7)return`${o}d ago`;const c=Math.floor(o/7);if(c<4)return`${c}w ago`;const f=Math.floor(o/30);return f<12?`${f}mo ago`:`${Math.floor(o/365)}y ago`}function d(n){return new Intl.DateTimeFormat("en-US",{year:"numeric",month:"long",day:"numeric"}).format(n)}export{l as C,m as S,h as T,u as a,d as f};
