"use strict";var _slicedToArray=function(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function(e,t){var r=[],a=!0,n=!1,i=void 0;try{for(var o,l=e[Symbol.iterator]();!(a=(o=l.next()).done)&&(r.push(o.value),!t||r.length!==t);a=!0);}catch(e){n=!0,i=e}finally{try{!a&&l.return&&l.return()}finally{if(n)throw i}}return r}(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")};function _toArray(e){return Array.isArray(e)?e:Array.from(e)}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}!function(){function _(e,t,r){return{type:e,target:t,data:r,done:!1}}function e(){return{height:0}}e.update=function(e){e.done||4==++e.data.height&&(e.done=!0)};var t=Object.freeze({default:e});function r(e){return{height:4,time:0}}r.update=function(e){if(!e.done){var t=e.data;t.time++;var r=t.time%120/120;t.height=4+Math.sin(2*Math.PI*r)}};var a=Object.freeze({default:r});function n(e){return{height:Math.round(e||4)}}n.update=function(e){e.done||--e.data.height||(e.done=!0)};var i=Object.freeze({default:n});function o(e){return{path:e,cell:e[0].slice(),time:0}}o.update=function(e){if(e.done)return!1;var t=e.data,r=Math.floor(t.time/4),a=t.time%4*.25,n=t.path[r],i=t.path[r+1];return i?t.cell=[n[0]+(i[0]-n[0])*a,n[1]+(i[1]-n[1])*a]:(t.cell=n.slice(),e.done=!0),t.time++,!0};var l=Object.freeze({default:o});function u(e,t){var r=[t[0]-e[0],t[1]-e[1]],a=Math.sqrt(r[0]*r[0]+r[1]*r[1]);return{src:e,norm:[r[0]/a,r[1]/a],cell:e.slice(),time:0}}u.update=function(e){if(!e.done){var t=e.data,r=t.time<=4?t.time:4-(t.time-4);t.cell[0]=t.src[0]+t.norm[0]/8*r,t.cell[1]=t.src[1]+t.norm[1]/8*r,9==++t.time&&(e.done=!0)}};var s=Object.freeze({default:u});function c(){return{time:0,flashing:!1}}c.update=function(e){if(!e.done){var t=e.data;t.flashing=!t.flashing,15==++t.time&&(e.done=!0)}};var f=Object.freeze({default:c});function h(){return{time:0,visible:!0}}h.update=function(e){if(!e.done){var t=e.data;t.visible=!t.visible,30==++t.time&&(e.done=!0)}};var p=Object.freeze({default:h}),z={lift:t&&e||t,float:a&&r||a,drop:i&&n||i,move:l&&o||l,attack:s&&u||s,flinch:f&&c||f,fade:p&&h||p};function D(e,t){return Math.abs(t[0]-e[0])+Math.abs(t[1]-e[1])}function g(e){return e[0]}function d(e){return e[1]}function qe(e,t){return g(e)===g(t)&&d(e)===d(t)}function E(e,t){t||(t=1);for(var r=[{steps:0,cell:e}],a=[];r.length;)for(var n=r.shift(),i=[[g(n.cell)-1,d(n.cell)],[g(n.cell)+1,d(n.cell)],[g(n.cell),d(n.cell)-1],[g(n.cell),d(n.cell)+1]],o=0;o<i.length;o++){var l=i[o];if(!qe(e,l)){for(var u=0;u<a.length;u++){if(qe(l,a[u]))break}u<a.length||(a.push(l),n.steps+1<t&&r.push({steps:n.steps+1,cell:l}))}}return a}function v(e){return e.layout.size[0]}function Pe(e,t){return e.tiles[e.layout.data[d(t)*v(e)+g(t)]]}function L(e,t){for(var r=0;r<e.units.length;r++){var a=e.units[r];if(qe(t,a.cell))return a}}function m(e,t){return 0<=g(t)&&g(t)<v(e)&&0<=d(t)&&d(t)<e.layout.size[1]}function y(e,t,r){return{type:e,faction:t,cell:r,hp:3}}function R(e,t){if("warrior"===e.type)if("warrior"===t.type)t.hp-=2;else if("knight"===t.type)t.hp-=2;else{if("rogue"===t.type)return;"mage"===t.type&&(t.hp-=3)}else if("knight"===e.type)"warrior"===t.type?t.hp-=2:"knight"===t.type?t.hp-=1:"rogue"===t.type?t.hp-=2:"mage"===t.type&&(t.hp-=2);else if("rogue"===e.type)if("warrior"===t.type)t.hp-=2;else{if("knight"===t.type)return;"rogue"===t.type?t.hp-=1:"mage"===t.type&&(t.hp-=2)}else"mage"===e.type&&("warrior"===t.type?t.hp-=2:"knight"===t.type?t.hp-=1:"rogue"===t.type?t.hp-=2:"mage"===t.type&&(t.hp-=1));t.hp<0&&(t.hp=0)}function Be(e){switch(e.type){case"warrior":return 4;case"knight":return 3;case"rogue":return 7;case"mage":return 4}}function j(e){switch(e.type){case"warrior":case"knight":case"rogue":return 1;case"mage":return 2}}function Xe(e,t){return e.faction===t.faction||"player"===e.faction&&"ally"===t.faction||"ally"===e.faction&&"player"===t.faction}function Ye(e,t){var r=j(t),a=Be(t);if(!a)return[];for(var n=[{steps:0,cell:t.cell}],i=[t.cell];n.length;)for(var o=n.shift(),l=E(o.cell),u=0;u<l.length;u++){var s=l[u];if(m(e,s))if(!Pe(e,s).solid){for(var c=0;c<i.length&&!qe(s,i[c]);c++);if(!(c<i.length)){for(c=0;c<e.units.length;c++){if(qe(s,(g=e.units[c]).cell))break;g=null}if((!g||g&&!Xe(t,g))&&i.push(s),(!g||g&&Xe(t,g))&&o.steps<a-1)n.push({steps:o.steps+1,cell:s});else{var f=E(s,r);for(c=0;c<f.length;c++){var h=f[c];if(m(e,h)&&!qe(h,t.cell)){for(var p=0;p<i.length&&!qe(h,i[p]);p++);if(!(p<i.length)){for(p=0;p<e.units.length;p++){var g;if(qe(h,(g=e.units[p]).cell))break;g=null}g&&i.push(h)}}}}}}}return i}function I(e,t){var r=document.createElement("canvas");return r.width=e,r.height=t,r.getContext("2d")}var Fe={warrior:"axe",knight:"shield",rogue:"dagger",mage:"hat"};function q(e,t){var r=e.phase.pending;r.splice(r.indexOf(t),1),r.length||function e(t){var r=t.map,a=t.phase;a.faction="player"===a.faction?"enemy":"player";a.pending=r.units.filter(function(e){return e.faction===a.faction});a.pending.length||e(t)}(e)}function P(e){return{sprites:e,context:document.createElement("canvas").getContext("2d"),anims:[],path:[],cursor:null,target:null,selection:null,hover:{time:0,target:null,dialog:null,entering:!1},cache:{time:0,phase:{faction:"player",next:"player",pending:[]},units:[],hover:{target:null,last:null},range:null,selection:null}}}P.render=function(c,e){var f=c.sprites,t=c.context,h=c.anims,r=c.cursor,p=c.cache,a=e.map,g=e.phase,n=_slicedToArray(a.layout.size,2),i=n[0],o=n[1],l=t.canvas,d=h[0],u=["tiles","shadows","walls","squares","pieces","arrows","cursor","selection","dialogs"],v={},s=!0,m=!1,y=void 0;try{for(var w,b=u[Symbol.iterator]();!(s=(w=b.next()).done);s=!0){var x=w.value;v[x]=[]}}catch(e){m=!0,y=e}finally{try{!s&&b.return&&b.return()}finally{if(m)throw y}}if(p.units.length||(p.units=a.units.map(function(e){return Object.assign({original:e},e)})),p.phase.pending.length<g.pending.length&&!h.find(function(e){return e.target.faction===p.phase.faction})&&(p.phase.pending=g.pending.slice()),p.phase.faction!==p.phase.next){var k=h.find(function(e){return e.target.faction===p.phase.faction});(!k||0<h.indexOf(k))&&(p.phase.faction=p.phase.next)}p.phase.next!==g.faction&&p.phase.faction===p.phase.next&&(p.phase.next=g.faction),l.width=16*i,l.height=16*o,t.beginPath(),t.fillStyle="black",t.fillRect(0,0,l.width,l.height);var I=c.hover.dialog;if(p.hover.target!==c.hover.target){p.hover.target=c.hover.target;var A=c.hover.target;if(c.hover.entering!==!!A&&(c.hover.entering=!!A),A){p.hover.last=A;var S=f.pieces.symbols[Fe[A.type]];(I=c.hover.dialog=f.ui.TextBox(["  "+A.type.toUpperCase(),"","HP  "+A.hp+"/3","STR "+function(e){switch(e.type){case"warrior":return 3;case"knight":return 2;case"rogue":return 1;case"mage":return 0}}(A),"INT "+function(e){switch(e.type){case"warrior":return 0;case"knight":return 2;case"rogue":return 1;case"mage":return 3}}(A),"AGI "+function(e){switch(e.type){case"warrior":return 2;case"knight":return 0;case"rogue":return 3;case"mage":return 1}}(A),"MOV "+Be(A)])).getContext("2d").drawImage(S,16,16)}}var M=c.hover.target||p.hover.last;if(M){var O=8<=M.cell[0]?-I.width:t.canvas.width,C=O+((8<=M.cell[0]?8:t.canvas.width-I.width-8)-O)/8*c.hover.time,T=t.canvas.height-I.height-8;c.hover.entering&&8<++c.hover.time?c.hover.time=8:!c.hover.entering&&--c.hover.time<0&&(c.hover.time=0),v.dialogs.push({image:I,position:[C,T]})}for(var _=0;_<o+1;_++)for(var z=0;z<i+1;z++){t.drawImage(f.tiles.floor,16*z,16*_),t.strokeStyle="player"===p.phase.faction?"green":"maroon";var D=Math.round(p.time/16)%16;t.beginPath(),t.strokeRect(16*z-(D+.5),16*_-(D+.5),16,16)}for(var E=0;E<o;E++)for(var L=0;L<i;L++){var R=Pe(a,[L,E]);if("wall"===R.name){var j=f.tiles.wall;Pe(a,[L,E+1])!==R&&(j=f.tiles["wall-base"]),v.walls.push({image:j,position:[16*L,16*E]})}}if(M=c.selection){p.selection!==M&&(p.range=Ye(a,M),p.selection=M);var q=!0,P=!1,B=void 0;try{for(var X,Y=p.range[Symbol.iterator]();!(q=(X=Y.next()).done);q=!0){var F=X.value,G=_slicedToArray(F,2),H=G[0],N=G[1],U="move",V=!0,J=!1,K=void 0;try{for(var Q,W=a.units[Symbol.iterator]();!(V=(Q=W.next()).done);V=!0){var Z=Q.value;if(qe(F,Z.cell)){U=Xe(M,Z)?"ally":"attack";break}}}catch(e){J=!0,K=e}finally{try{!V&&W.return&&W.return()}finally{if(J)throw K}}if("move"===U||"attack"===U){var $=f.ui.squares[U];v.squares.push({image:$,position:[16*H,16*N]})}}}catch(e){P=!0,B=e}finally{try{!q&&Y.return&&Y.return()}finally{if(P)throw B}}}else p.range=null,p.selection=null;for(var ee=function(e){var t=p.units[e],r={warrior:"axe",knight:"shield",rogue:"dagger",mage:"hat"}[t.type],a=f.pieces[t.faction][r],n=t.cell,i=0;if(d&&t.original===d.target){if("lift"===d.type||"float"===d.type||"drop"===d.type)i=-d.data.height;else if("move"===d.type)n=d.data.cell,d.done&&(t.cell=d.data.cell);else if("attack"===d.type)n=d.data.cell;else if("flinch"===d.type)d.data.flashing&&(a=f.pieces.flashing);else if("fade"===d.type){if(d.done)return p.units.splice(e--,1),"continue";if(!d.data.visible)return"continue"}}else!p.phase.pending.includes(t.original)||g.pending.includes(t.original)||h.length||p.phase.pending.splice(p.phase.pending.indexOf(t.original),1);var o=_slicedToArray(n,2),l=o[0],u=o[1];t.faction!==p.phase.faction||p.phase.pending.includes(t.original)||h.find(function(e){return e.target===t.original})||(a=f.pieces.done[t.faction][r]);var s="pieces";(t.original===c.selection||h.find(function(e){return["lift","float","drop","attack"].includes(e.type)&&e.target===t.original}))&&(s="selection"),v[s].push({image:a,position:[16*l,16*u+i]}),v.shadows.push({image:f.pieces.shadow,position:[16*l+1,16*u+4]}),te=e},te=0;te<p.units.length;te++)ee(te);if(c.path.length){var re=c.path;for(te=0;te<re.length;te++){var ae=_slicedToArray(re[te],2),ne=ae[0],ie=ae[1],oe=!1,le=!1,ue=!1,se=!1,ce=re[te-1];if(ce){var fe=ne-ce[0],he=ie-ce[1];1===fe?oe=!0:-1===fe&&(le=!0),1===he?ue=!0:-1===he&&(se=!0)}var pe=re[te+1];if(pe){var ge=pe[0]-ne,de=pe[1]-ie;-1===ge?oe=!0:1===ge&&(le=!0),-1===de?ue=!0:1===de&&(se=!0)}if(oe||le||ue||se){var ve=null;oe&&le?ve="horiz":ue&&se?ve="vert":ue&&oe?ve="upLeft":ue&&le?ve="upRight":se&&oe?ve="downLeft":se&&le?ve="downRight":oe&&!te?ve="leftStub":le&&!te?ve="rightStub":ue&&!te?ve="upStub":se&&!te?ve="downStub":oe?ve="left":le?ve="right":ue?ve="up":se&&(ve="down"),ve&&v.arrows.push({image:f.ui.arrows[ve],position:[16*ne,16*ie]})}}}if(r){var me=_slicedToArray(r,2),ye=me[0],we=me[1],be=Math.floor(p.time/30)%f.ui.cursor.length;v.cursor.push({image:f.ui.cursor[be],position:[16*ye,16*we]})}var xe=!0,ke=!1,Ie=void 0;try{for(var Ae,Se=u[Symbol.iterator]();!(xe=(Ae=Se.next()).done);xe=!0){var Me=Ae.value,Oe=v[Me];Oe.sort(function(e,t){return e.position[1]-t.position[1]});var Ce=!0,Te=!1,_e=void 0;try{for(var ze,De=Oe[Symbol.iterator]();!(Ce=(ze=De.next()).done);Ce=!0){var Ee=ze.value,Le=_slicedToArray(Ee.position,3),Re=Le[0],je=Le[1];Le[2],t.drawImage(Ee.image,Math.round(Re),Math.round(je))}}catch(e){Te=!0,_e=e}finally{try{!Ce&&De.return&&De.return()}finally{if(Te)throw _e}}}}catch(e){ke=!0,Ie=e}finally{try{!xe&&Se.return&&Se.return()}finally{if(ke)throw Ie}}},P.update=function(e){e.cache.time++;var t=e.anims,r=t[0];r&&(r.done?t.shift():z[r.type].update(r))};var w={piece:{palette:[0,120,3,3],shadow:[112,56,14,14],symbols:{shield:[112,112,8,8],bow:[112,8,8,8],dagger:[112,70,8,8],sword:[112,34,8,8],axe:[112,16,8,8],hat:[112,104,8,8],lance:[112,0,8,8]},base:[96,104,16,16]},tiles:{"wall-base":[96,34,16,16],floor:[96,16,16,16],wall:[80,34,16,16]},ui:{cursor:[64,104,32,16],box:[64,56,48,48],squares:[80,0,32,16],arrows:[0,56,64,64],typeface:[0,0,80,56],swords:[80,16,16,18]}};function b(e,t,r,a,n){var i=document.createElement("canvas"),o=i.getContext("2d");return i.width=a,i.height=n,o.drawImage(e,-t,-r),i}var A={get:function(e,t,r){var a=4*(r*e.width+t),n=e.data[a],i=e.data[a+1],o=e.data[a+2],l=e.data[a+3];return[n,i,o,l]},replace:function(e,t,r){for(var a=0;a<e.data.length;a+=4){for(var n=0;n<4&&e.data[a+n]===t[n];n++);if(4===n)for(var n=0;n<4;n++)e.data[a+n]=r[n]}}};function x(e){var t=function e(t,r){var a={};for(var n in r)if(Array.isArray(r[n])){var i=_slicedToArray(r[n],4),o=i[0],l=i[1],u=i[2],s=i[3];a[n]=b(t,o,l,u,s)}else a[n]=e(t,r[n]);return a}(e,w);return{tiles:t.tiles,pieces:function(e){var t={player:{},enemy:{},ally:{},done:{player:{},enemy:{},ally:{}},flashing:null,symbols:e.symbols,shadow:e.shadow},r=e.palette.getContext("2d").getImageData(0,0,3,3),a={black:[0,0,0,255],white:[255,255,255,255],cyan:A.get(r,0,0),blue:A.get(r,1,0),navy:A.get(r,2,0),pink:A.get(r,0,1),red:A.get(r,1,1),purple:A.get(r,2,1),lime:A.get(r,0,2),green:A.get(r,1,2),teal:A.get(r,2,2)},n={player:[a.cyan,a.blue,a.navy],enemy:[a.pink,a.red,a.purple],ally:[a.lime,a.green,a.teal]};for(var i in n){var o=n[i];for(var l in e.symbols){var u=e.symbols[l],s=I(u.width,u.height);s.drawImage(u,0,0);var c=e.base.getContext("2d").getImageData(0,0,16,16);A.replace(c,a.white,o[1]),A.replace(c,a.black,o[2]);var f=I(c.width,c.height);f.putImageData(c,0,0);var h=s.getImageData(0,0,u.width,u.height);A.replace(h,a.white,o[0]),s.putImageData(h,0,0),f.drawImage(s.canvas,4,4),A.replace(h,o[0],o[2]),s.putImageData(h,0,0),f.drawImage(s.canvas,4,3),t[i][l]=f.canvas}}for(var p in n){var g=n[p];for(var d in e.symbols){var v=e.symbols[d],m=I(v.width,v.height);m.drawImage(v,0,0);var y=e.base.getContext("2d").getImageData(0,0,16,16);A.replace(y,a.white,g[2]);var w=I(y.width,y.height);w.putImageData(y,0,0);var b=m.getImageData(0,0,v.width,v.height);A.replace(b,a.white,g[1]),m.putImageData(b,0,0),w.drawImage(m.canvas,4,4),A.replace(b,g[1],a.black),m.putImageData(b,0,0),w.drawImage(m.canvas,4,3),t.done[p][d]=w.canvas}}var x=e.base.getContext("2d").getImageData(0,0,16,16);A.replace(x,a.blue,a.white),A.replace(x,a.navy,a.white);var k=I(x.width,x.height);return k.putImageData(x,0,0),t.flashing=k.canvas,t}(t.piece),ui:function(e){var s={swords:e.swords,cursor:function(e){for(var t=e.width/16,r=new Array(t),a=0;a<t;a++)r[a]=b(e,16*a,0,16,16);return r}(e.cursor),typeface:function(e){for(var t={},r=0,a=0;a<7;a++)for(var n=0;n<10;n++){var i="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ,.!?abcdefghijklmnopqrstuvwxyz'\"/ "[r++];t[i]=b(e,8*n,8*a,8,8)}return t}(e.typeface),box:{topLeft:b(e.box,0,0,16,16),top:b(e.box,16,0,16,16),topRight:b(e.box,32,0,16,16),left:b(e.box,0,16,16,16),center:b(e.box,16,16,16,16),right:b(e.box,32,16,16,16),bottomLeft:b(e.box,0,32,16,16),bottom:b(e.box,16,32,16,16),bottomRight:b(e.box,32,32,16,16)},squares:{move:b(e.squares,0,0,16,16),attack:b(e.squares,16,0,16,16)},arrows:{left:b(e.arrows,0,0,16,16),right:b(e.arrows,16,0,16,16),up:b(e.arrows,32,0,16,16),down:b(e.arrows,48,0,16,16),leftStub:b(e.arrows,0,16,16,16),rightStub:b(e.arrows,16,16,16,16),upStub:b(e.arrows,32,16,16,16),downStub:b(e.arrows,48,16,16,16),upLeft:b(e.arrows,0,32,16,16),upRight:b(e.arrows,16,32,16,16),downLeft:b(e.arrows,32,32,16,16),downRight:b(e.arrows,48,32,16,16),horiz:b(e.arrows,0,48,16,16),vert:b(e.arrows,16,48,16,16)}};return s.Text=c,s.Box=f,s.TextBox=function(e){var t=e.map(function(e){return e.length}),r=8*Math.max.apply(Math,_toConsumableArray(t)),a=8*e.length,n=f(r+32,a+32),i=document.createElement("canvas"),o=i.getContext("2d");i.width=r,i.height=a;for(var l=0;l<e.length;l++){var u=e[l];o.drawImage(c(u),0,8*l)}return n.getContext("2d").drawImage(i,16,16),n},s;function c(e){var t=document.createElement("canvas");t.width=8*e.length,t.height=8;for(var r=t.getContext("2d"),a=0;a<e.length;a++){var n=e[a],i=s.typeface[n];r.drawImage(i,8*a,0)}return t}function f(e,t){var r=Math.ceil(e/16),a=Math.ceil(t/16),n=document.createElement("canvas"),i=n.getContext("2d");n.width=e,n.height=t;for(var o=1;o<r-1;o++)i.drawImage(s.box.top,16*o,0),i.drawImage(s.box.bottom,16*o,t-16);for(var l=1;l<a-1;l++){i.drawImage(s.box.left,0,16*l),i.drawImage(s.box.right,e-16,16*l);for(var u=1;u<r-1;u++)i.drawImage(s.box.center,16*u,16*l)}return i.drawImage(s.box.topLeft,0,0),i.drawImage(s.box.topRight,n.width-16,0),i.drawImage(s.box.bottomLeft,0,n.height-16),i.drawImage(s.box.bottomRight,n.width-16,n.height-16),n}}(t.ui)}}function B(e,t,r){for(var a=[],n=[t],i={},o={},l={},u={},s={},c=0;c<e.length;c++){u[h=e[c]]=1/0,s[h]=1/0}for(u[t]=0,s[t]=D(t,r);n.length;){var f={score:1/0,index:-1,cell:null};for(c=0;c<n.length;c++){(v=s[h=n[c]])<f.score&&(f.score=v,f.index=c,f.cell=h)}var h;if(qe(h=f.cell,r)){for(;!qe(h,t);)a.unshift(h),h=l[h];return a.unshift(h),a}n.splice(f.index,1),i[h]=!1,o[h]=!0;var p=E(h);for(c=0;c<p.length;c++){var g=p[c];if(!o[g]){for(var d=0;d<e.length;d++){if(qe(e[d],g))break}var v;if(d!==e.length)i[g]||(i[g]=!0,n.push(g)),(v=u[h]+1)>=u[g]||(l[g]=h,u[g]=v,s[g]=v+D(g,r))}}}}var k,S=document.querySelector("main");(k="sprites.png",new Promise(function(e,t){var r=new Image;r.src=k,r.onload=function(){e(r)},r.onerror=function(){t(new Error("Failed to load image `"+k+"`"))}})).then(function(e){var C=P(x(e)),T=C.context.canvas,c=!1,O=null;S.appendChild(T),function e(){P.render(C,F);P.update(C);if("enemy"===Y.faction){if(!O){var t=X.units.filter(function(e){return"enemy"===e.faction});O=function(x,t){for(var k=[],I={tiles:x.tiles,layout:x.layout,units:x.units.map(function(e){return Object.assign({},e)})},A=[],e=_slicedToArray(x.layout.size,2),r=e[0],a=e[1],n=0;n<a;n++)for(var i=0;i<r;i++){var o=n*r+i,l=x.layout.data[o];x.tiles[l].solid||A.push([i,n])}var u=I.units.filter(function(e){return e.faction===t}),s=function(r){var e=[],a=[],n=Ye(I,r),t=!0,i=!1,o=void 0;try{for(var l,u=n[Symbol.iterator]();!(t=(l=u.next()).done);t=!0){var s=l.value,c=L(I,s);c&&!Xe(r,c)&&a.push(c)}}catch(e){i=!0,o=e}finally{try{!t&&u.return&&u.return()}finally{if(i)throw o}}if(a.length){a.sort(function(e,t){return e.hp-t.hp}),3===a[0].hp&&a.sort(function(e,t){return D(r.cell,e.cell)-D(r.cell,t.cell)});var f=a[0],h=E(f.cell,j(r)).filter(function(t){return n.find(function(e){return qe(e,t)})&&!L(I,t)});if(h.length){h.sort(function(e,t){return D(f.cell,t)-D(f.cell,e)});var p=h[0];e.push(["move",p],["attack",x.units[I.units.indexOf(f)]]),r.cell=p,R(r,f)}}else if((a=I.units.filter(function(e){return!Xe(r,e)})).length){var g=a.map(function(e){return B(A,r.cell,e.cell).slice(0,-1)});a.sort(function(e,t){return g[a.indexOf(e)].length-g[a.indexOf(t)]});for(var d=a[0],v=g.find(function(e){return 1===D(e[e.length-1],d.cell)}),m=[],y=function(e){var t=n[e],r=v.find(function(e){return qe(t,e)});r&&!L(I,t)&&m.push(r)},w=0;w<n.length;w++)y(w);if(m.length){m.sort(function(e,t){return v.indexOf(t)-v.indexOf(e)});var b=m[0];e.push(["move",b]),r.cell=b}}k.push(e)},c=!0,f=!1,h=void 0;try{for(var p,g=u[Symbol.iterator]();!(c=(p=g.next()).done);c=!0)s(p.value)}catch(e){f=!0,h=e}finally{try{!c&&g.return&&g.return()}finally{if(f)throw h}}return k}(X,"enemy");for(var r=0;r<O.length;r++){var a=O[r],n=t[r],i=!0,o=!1,l=void 0;try{for(var u,s=a[Symbol.iterator]();!(i=(u=s.next()).done);i=!0){var c=u.value,f=_toArray(c),h=f[0],p=f.slice(1);if("move"===h){var g=_slicedToArray(p,1),d=g[0],v=Ye(X,n),m=!0,y=!1,w=void 0;try{for(var b,x=t[Symbol.iterator]();!(m=(b=x.next()).done);m=!0){var k=b.value;v.push(k.cell)}}catch(e){y=!0,w=e}finally{try{!m&&x.return&&x.return()}finally{if(y)throw w}}var I=B(v,n.cell,d);C.anims.push(_("move",n,z.move(I))),n.cell=d}else if("attack"===h){var A=_slicedToArray(p,1),S=A[0];if(!X.units.includes(S))continue;var M=S.hp;R(n,S),C.anims.push(_("attack",n,z.attack(n.cell,S.cell))),S.hp<M&&C.anims.push(_("flinch",S,z.flinch())),S.hp||(X.units.splice(X.units.indexOf(S),1),C.anims.push(_("fade",S,z.fade())))}}}catch(e){o=!0,l=e}finally{try{!i&&s.return&&s.return()}finally{if(o)throw l}}q(F,n)}}}else O=null;requestAnimationFrame(e)}(),window.addEventListener("mousemove",function(e){var t=[Math.floor(e.offsetX/16),Math.floor(e.offsetY/16)];if(e.target===T){C.cursor=t;var r=L(X,t);C.hover.target=r||null;var a=C.selection;if(a){var n=C.path[C.path.length-1],i=L(X,t);if(qe(t,a.cell))C.path=[a.cell];else if(!qe(n,t)&&!(i&&D(n,t)<=j(a))&&C.cache.range.find(function(e){return qe(e,t)})){for(var o=0;o<C.path.length;o++){var l=C.path[o];if(qe(l,t))break}if(o<C.path.length)return void C.path.splice(o+1,C.path.length-o-1);for(var u=C.cache.range.slice(),s=0;s<u.length;s++){var c=u[s];if(c){var f=L(X,c);f&&!Xe(a,f)&&u.splice(s--,1)}}var h=X.units.filter(function(e){return Xe(a,e)}),p=!0,g=!1,d=void 0;try{for(var v,m=h[Symbol.iterator]();!(p=(v=m.next()).done);p=!0){var y=v.value;u.push(y.cell)}}catch(e){g=!0,d=e}finally{try{!p&&m.return&&m.return()}finally{if(g)throw d}}for(var w=u.slice(),b=0;b<w.length;b++)for(var x=w[b],k=0;k<C.path.length;k++){var I=C.path[k];if(qe(x,I)){w.splice(b--,1);break}}var A=t;if(i){var S=E(i.cell,j(a)).filter(function(t){return u.find(function(e){return qe(e,t)})});S.length&&(A=S[0])}if(h.find(function(e){return qe(A,e.cell)}))return;var M,O=B(w,n,A);if(O&&C.path.length+O.length-2<=Be(a))O.shift(),(M=C.path).push.apply(M,_toConsumableArray(O));else C.path=B(u,a.cell,A)}}}else C.cursor=null}),T.addEventListener("mousedown",function(e){if(C.cursor||(C.cursor=[Math.floor(e.offsetX/16),Math.floor(e.offsetY/16)]),!C.selection){var t=L(X,C.cursor);t&&"player"===t.faction&&"player"===Y.faction&&Y.pending.includes(t)&&(c=!0,C.selection=t,C.path=[t.cell],C.anims.push(_("lift",t,z.lift()),_("float",t,z.float())))}}),T.addEventListener("mouseup",function(e){C.cursor||(C.cursor=[Math.floor(e.offsetX/16),Math.floor(e.offsetY/16)]);var t=C.selection;if(t){if(qe(C.cursor,t.cell)){if(c)c=!1;else{C.selection=null,C.path=[],q(F,t);var r=null,a=C.anims[0];!a||"lift"!==a.type&&"float"!==a.type||(r=a.data.height,C.anims.shift()),C.anims.push(_("drop",t,z.drop(r)))}return}if(C.cache.range.find(function(e){return qe(e,C.cursor)})){c=!1;var n=C.selection,i=L(X,C.cursor);if(i&&Xe(n,i))return;"float"===C.anims[0].type&&C.anims.shift();var o=_("move",n,z.move(C.path));if(C.anims.push(o),n.cell=C.path[C.path.length-1],i){var l=i.hp;R(n,i),C.anims.push(_("attack",n,z.attack(n.cell,i.cell))),i.hp<l&&C.anims.push(_("flinch",i,z.flinch())),i.hp||(X.units.splice(X.units.indexOf(i),1),C.anims.push(_("fade",i,z.fade())))}q(F,n)}else{var u=null,s=C.anims[0];!s||"lift"!==s.type&&"float"!==s.type||(u=s.data.height,C.anims.shift()),C.anims.push(_("drop",t,z.drop(u)))}c||(C.selection=null,C.path=[])}})});for(var X={tiles:[{name:"null",solid:!1},{name:"wall",solid:!0}],layout:{size:[16,16],data:[1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,1,0,1,1,1,0,0,0,1,1,1,1,1,1,0,1,1,0,1,1,1,0,0,0,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},units:[y("warrior","player",[14,10]),y("rogue","player",[1,0]),y("mage","player",[8,11]),y("knight","enemy",[6,1]),y("warrior","enemy",[4,2]),y("warrior","enemy",[8,2]),y("mage","enemy",[13,1]),y("warrior","enemy",[12,3]),y("knight","enemy",[14,5]),y("mage","enemy",[11,8])]},Y={faction:"player",pending:[]},F={phase:Y,map:X},M=0;M<X.units.length;M++){var O=X.units[M];O.faction===Y.faction&&Y.pending.push(O)}}();