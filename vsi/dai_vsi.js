(function(){(function(){/*

  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  */
  var h,aa=function(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}},ba="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;a[b]=c.value;return a},ca=function(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");
  },da=ca(this),ea=function(a,b){if(b)a:{var c=da;a=a.split(".");for(var d=0;d<a.length-1;d++){var f=a[d];if(!(f in c))break a;c=c[f]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&ba(c,a,{configurable:!0,writable:!0,value:b})}};
  ea("Symbol",function(a){if(a)return a;var b=function(e,g){this.g=e;ba(this,"description",{configurable:!0,writable:!0,value:g})};b.prototype.toString=function(){return this.g};var c="jscomp_symbol_"+(1E9*Math.random()>>>0)+"_",d=0,f=function(e){if(this instanceof f)throw new TypeError("Symbol is not a constructor");return new b(c+(e||"")+"_"+d++,e)};return f});
  ea("Symbol.iterator",function(a){if(a)return a;a=Symbol("Symbol.iterator");for(var b="Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "),c=0;c<b.length;c++){var d=da[b[c]];"function"===typeof d&&"function"!=typeof d.prototype[a]&&ba(d.prototype,a,{configurable:!0,writable:!0,value:function(){return fa(aa(this))}})}return a});
  var fa=function(a){a={next:a};a[Symbol.iterator]=function(){return this};return a},ha="function"==typeof Object.create?Object.create:function(a){var b=function(){};b.prototype=a;return new b},ia;if("function"==typeof Object.setPrototypeOf)ia=Object.setPrototypeOf;else{var ja;a:{var ka={a:!0},la={};try{la.__proto__=ka;ja=la.a;break a}catch(a){}ja=!1}ia=ja?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}
  var ma=ia,k=function(a,b){a.prototype=ha(b.prototype);a.prototype.constructor=a;if(ma)ma(a,b);else for(var c in b)if("prototype"!=c)if(Object.defineProperties){var d=Object.getOwnPropertyDescriptor(b,c);d&&Object.defineProperty(a,c,d)}else a[c]=b[c];a.ja=b.prototype},na=function(a,b){a instanceof String&&(a+="");var c=0,d=!1,f={next:function(){if(!d&&c<a.length){var e=c++;return{value:b(e,a[e]),done:!1}}d=!0;return{done:!0,value:void 0}}};f[Symbol.iterator]=function(){return f};return f};
  ea("Array.prototype.keys",function(a){return a?a:function(){return na(this,function(b){return b})}});
  var l=this||self,n=function(a){var b=typeof a;return"object"!=b?b:a?Array.isArray(a)?"array":b:"null"},oa=function(a){var b=n(a);return"array"==b||"object"==b&&"number"==typeof a.length},p=function(a){var b=typeof a;return"object"==b&&null!=a||"function"==b},pa=function(a,b){function c(){}c.prototype=b.prototype;a.ja=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.base=function(d,f,e){for(var g=Array(arguments.length-2),m=2;m<arguments.length;m++)g[m-2]=arguments[m];return b.prototype[f].apply(d,
  g)}},qa=function(a){return a};function q(a){if(Error.captureStackTrace)Error.captureStackTrace(this,q);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))}pa(q,Error);q.prototype.name="CustomError";var r=function(a,b){a=a.split("%s");for(var c="",d=a.length-1,f=0;f<d;f++)c+=a[f]+(f<b.length?b[f]:"%s");q.call(this,c+a[d])};pa(r,q);r.prototype.name="AssertionError";
  var t=function(a,b,c,d){var f="Assertion failed";if(c){f+=": "+c;var e=d}else a&&(f+=": "+a,e=b);throw new r(""+f,e||[]);},u=function(a,b,c){a||t("",null,b,Array.prototype.slice.call(arguments,2))},w=function(a,b){throw new r("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));},x=function(a,b,c){"number"!==typeof a&&t("Expected number but got %s: %s.",[n(a),a],b,Array.prototype.slice.call(arguments,2));return a},ra=function(a,b,c){"string"!==typeof a&&t("Expected string but got %s: %s.",
  [n(a),a],b,Array.prototype.slice.call(arguments,2))},sa=function(a,b,c){p(a)&&1==a.nodeType||t("Expected Element but got %s: %s.",[n(a),a],b,Array.prototype.slice.call(arguments,2));return a};var z=Array.prototype.forEach?function(a,b,c){u(null!=a.length);Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,f="string"===typeof a?a.split(""):a,e=0;e<d;e++)e in f&&b.call(c,f[e],e,a)},ta=Array.prototype.map?function(a,b){u(null!=a.length);return Array.prototype.map.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=Array(c),f="string"===typeof a?a.split(""):a,e=0;e<c;e++)e in f&&(d[e]=b.call(void 0,f[e],e,a));return d};
  function ua(a){return Array.prototype.concat.apply([],arguments)}function va(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]};var Da=function(a,b){if(b)a=a.replace(wa,"&amp;").replace(xa,"&lt;").replace(ya,"&gt;").replace(za,"&quot;").replace(Aa,"&#39;").replace(Ba,"&#0;");else{if(!Ca.test(a))return a;-1!=a.indexOf("&")&&(a=a.replace(wa,"&amp;"));-1!=a.indexOf("<")&&(a=a.replace(xa,"&lt;"));-1!=a.indexOf(">")&&(a=a.replace(ya,"&gt;"));-1!=a.indexOf('"')&&(a=a.replace(za,"&quot;"));-1!=a.indexOf("'")&&(a=a.replace(Aa,"&#39;"));-1!=a.indexOf("\x00")&&(a=a.replace(Ba,"&#0;"))}return a},wa=/&/g,xa=/</g,ya=/>/g,za=/"/g,Aa=/'/g,
  Ba=/\x00/g,Ca=/[\x00&<>"']/;var A;a:{var Ea=l.navigator;if(Ea){var Fa=Ea.userAgent;if(Fa){A=Fa;break a}}A=""}var B=function(a){return-1!=A.indexOf(a)};function Ga(a,b){for(var c in a)b.call(void 0,a[c],c,a)}var Ha="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Ia(a,b){for(var c,d,f=1;f<arguments.length;f++){d=arguments[f];for(c in d)a[c]=d[c];for(var e=0;e<Ha.length;e++)c=Ha[e],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};var Ja={area:!0,base:!0,br:!0,col:!0,command:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0};var Ka;var C=function(a,b){this.g=a===La&&b||"";this.h=Ma};C.prototype.v=!0;C.prototype.s=function(){return this.g};C.prototype.toString=function(){return"Const{"+this.g+"}"};var Na=function(a){if(a instanceof C&&a.constructor===C&&a.h===Ma)return a.g;w("expected object of type Const, got '"+a+"'");return"type_error:Const"},Ma={},La={};var Pa=function(a,b){this.g=b===Oa?a:""};h=Pa.prototype;h.v=!0;h.s=function(){return this.g.toString()};h.U=!0;h.B=function(){return 1};h.toString=function(){return this.g+""};var Oa={};var D=function(a,b){this.g=b===Qa?a:""};h=D.prototype;h.v=!0;h.s=function(){return this.g.toString()};h.U=!0;h.B=function(){return 1};h.toString=function(){return this.g.toString()};
  var Ra=function(a){if(a instanceof D&&a.constructor===D)return a.g;w("expected object of type SafeUrl, got '"+a+"' of type "+n(a));return"type_error:SafeUrl"},Sa=/^(?:audio\/(?:3gpp2|3gpp|aac|L16|midi|mp3|mp4|mpeg|oga|ogg|opus|x-m4a|x-matroska|x-wav|wav|webm)|font\/\w+|image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp|x-icon)|video\/(?:mpeg|mp4|ogg|webm|quicktime|x-matroska))(?:;\w+=(?:\w+|"[\w;,= ]+"))*$/i,Ta=/^data:(.*);base64,[a-z0-9+\/]+=*$/i,Ua=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i,Va=function(a){if(a instanceof
  D)return a;a="object"==typeof a&&a.v?a.s():String(a);if(Ua.test(a))a=new D(a,Qa);else{a=String(a);a=a.replace(/(%0A|%0D)/g,"");var b=a.match(Ta);a=b&&Sa.test(b[1])?new D(a,Qa):null}return a},Qa={},Wa=new D("about:invalid#zClosurez",Qa);var E=function(a,b){this.g=b===Xa?a:""};E.prototype.v=!0;E.prototype.s=function(){return this.g};E.prototype.toString=function(){return this.g.toString()};
  var Xa={},Ya=new E("",Xa),$a=function(a){if(a instanceof D)return'url("'+Ra(a).replace(/</g,"%3c").replace(/[\\"]/g,"\\$&")+'")';a=a instanceof C?Na(a):Za(String(a));if(/[{;}]/.test(a))throw new r("Value does not allow [{;}], got: %s.",[a]);return a},Za=function(a){var b=a.replace(ab,"$1").replace(ab,"$1").replace(bb,"url");if(cb.test(b)){if(db.test(a))return w("String value disallows comments, got: "+a),"zClosurez";for(var c=b=!0,d=0;d<a.length;d++){var f=a.charAt(d);"'"==f&&c?b=!b:'"'==f&&b&&(c=
  !c)}if(!b||!c)return w("String value requires balanced quotes, got: "+a),"zClosurez";if(!eb(a))return w("String value requires balanced square brackets and one identifier per pair of brackets, got: "+a),"zClosurez"}else return w("String value allows only [-,.\"'%_!# a-zA-Z0-9\\[\\]] and simple functions, got: "+a),"zClosurez";return fb(a)},eb=function(a){for(var b=!0,c=/^[-_a-zA-Z0-9]$/,d=0;d<a.length;d++){var f=a.charAt(d);if("]"==f){if(b)return!1;b=!0}else if("["==f){if(!b)return!1;b=!1}else if(!b&&
  !c.test(f))return!1}return b},cb=/^[-,."'%_!# a-zA-Z0-9\[\]]+$/,bb=/\b(url\([ \t\n]*)('[ -&(-\[\]-~]*'|"[ !#-\[\]-~]*"|[!#-&*-\[\]-~]*)([ \t\n]*\))/g,ab=/\b(calc|cubic-bezier|fit-content|hsl|hsla|linear-gradient|matrix|minmax|repeat|rgb|rgba|(rotate|scale|translate)(X|Y|Z|3d)?)\([-+*/0-9a-z.%\[\], ]+\)/g,db=/\/\*/,fb=function(a){return a.replace(bb,function(b,c,d,f){var e="";d=d.replace(/^(['"])(.*)\1$/,function(g,m,y){e=m;return y});b=(Va(d)||Wa).s();return c+e+b+e+f})};var F=function(a,b,c){this.g=c===gb?a:"";this.h=b};h=F.prototype;h.U=!0;h.B=function(){return this.h};h.v=!0;h.s=function(){return this.g.toString()};h.toString=function(){return this.g.toString()};
  var G=function(a){if(a instanceof F&&a.constructor===F)return a.g;w("expected object of type SafeHtml, got '"+a+"' of type "+n(a));return"type_error:SafeHtml"},H=function(a){if(a instanceof F)return a;var b="object"==typeof a,c=null;b&&a.U&&(c=a.B());return hb(Da(b&&a.v?a.s():String(a)),c)},ib=/^[a-zA-Z0-9-]+$/,jb={action:!0,cite:!0,data:!0,formaction:!0,href:!0,manifest:!0,poster:!0,src:!0},kb={APPLET:!0,BASE:!0,EMBED:!0,IFRAME:!0,LINK:!0,MATH:!0,META:!0,OBJECT:!0,SCRIPT:!0,STYLE:!0,SVG:!0,TEMPLATE:!0},
  mb=function(a){var b=H(lb),c=b.B(),d=[],f=function(e){Array.isArray(e)?z(e,f):(e=H(e),d.push(G(e).toString()),e=e.B(),0==c?c=e:0!=e&&c!=e&&(c=null))};z(a,f);return hb(d.join(G(b).toString()),c)},nb=function(a){return mb(Array.prototype.slice.call(arguments))},gb={},hb=function(a,b){if(void 0===Ka){var c=null;var d=l.trustedTypes;if(d&&d.createPolicy){try{c=d.createPolicy("goog#html",{createHTML:qa,createScript:qa,createScriptURL:qa})}catch(f){l.console&&l.console.error(f.message)}Ka=c}else Ka=c}a=
  (c=Ka)?c.createHTML(a):a;return new F(a,b,gb)},lb=new F(l.trustedTypes&&l.trustedTypes.emptyHTML||"",0,gb),ob=hb("<br>",0);var pb={MATH:!0,SCRIPT:!0,STYLE:!0,SVG:!0,TEMPLATE:!0},qb=function(a){var b=!1,c;return function(){b||(c=a(),b=!0);return c}}(function(){if("undefined"===typeof document)return!1;var a=document.createElement("div"),b=document.createElement("div");b.appendChild(document.createElement("div"));a.appendChild(b);if(!a.firstChild)return!1;b=a.firstChild.firstChild;a.innerHTML=G(lb);return!b.parentElement}),I=function(a,b){if(a.tagName&&pb[a.tagName.toUpperCase()])throw Error("goog.dom.safe.setInnerHtml cannot be used to set content of "+
  a.tagName+".");if(qb())for(;a.lastChild;)a.removeChild(a.lastChild);a.innerHTML=G(b)};var rb=function(a){return a=Da(a,void 0)};var sb=B("Opera"),tb=B("Trident")||B("MSIE"),ub=B("Edge"),vb=B("Gecko")&&!(-1!=A.toLowerCase().indexOf("webkit")&&!B("Edge"))&&!(B("Trident")||B("MSIE"))&&!B("Edge"),wb=-1!=A.toLowerCase().indexOf("webkit")&&!B("Edge"),xb=function(){var a=l.document;return a?a.documentMode:void 0},yb;
  a:{var zb="",Ab=function(){var a=A;if(vb)return/rv:([^\);]+)(\)|;)/.exec(a);if(ub)return/Edge\/([\d\.]+)/.exec(a);if(tb)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(wb)return/WebKit\/(\S+)/.exec(a);if(sb)return/(?:Version)[ \/]?(\S+)/.exec(a)}();Ab&&(zb=Ab?Ab[1]:"");if(tb){var Bb=xb();if(null!=Bb&&Bb>parseFloat(zb)){yb=String(Bb);break a}}yb=zb}var Cb=yb,Db;if(l.document&&tb){var Eb=xb();Db=Eb?Eb:parseInt(Cb,10)||void 0}else Db=void 0;var Fb=Db;try{(new self.OffscreenCanvas(0,0)).getContext("2d")}catch(a){}var Gb;(Gb=!tb)||(Gb=9<=Number(Fb));var Hb=Gb;var J=function(a){var b=document;ra(a);b="string"===typeof a?b.getElementById(a):a;return b=sa(b,"No element found with id: "+a)},Jb=function(a,b){Ga(b,function(c,d){c&&"object"==typeof c&&c.v&&(c=c.s());"style"==d?a.style.cssText=c:"class"==d?a.className=c:"for"==d?a.htmlFor=c:Ib.hasOwnProperty(d)?a.setAttribute(Ib[d],c):0==d.lastIndexOf("aria-",0)||0==d.lastIndexOf("data-",0)?a.setAttribute(d,c):a[d]=c})},Ib={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",
  height:"height",maxlength:"maxLength",nonce:"nonce",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"},Lb=function(a,b,c){var d=arguments,f=document,e=String(d[0]),g=d[1];if(!Hb&&g&&(g.name||g.type)){e=["<",e];g.name&&e.push(' name="',rb(g.name),'"');if(g.type){e.push(' type="',rb(g.type),'"');var m={};Ia(m,g);delete m.type;g=m}e.push(">");e=e.join("")}e=String(e);"application/xhtml+xml"===f.contentType&&(e=e.toLowerCase());e=f.createElement(e);g&&("string"===
  typeof g?e.className=g:Array.isArray(g)?e.className=g.join(" "):Jb(e,g));2<d.length&&Kb(f,e,d);return e},Kb=function(a,b,c){function d(m){m&&b.appendChild("string"===typeof m?a.createTextNode(m):m)}for(var f=2;f<c.length;f++){var e=c[f];if(!oa(e)||p(e)&&0<e.nodeType)d(e);else{a:{if(e&&"number"==typeof e.length){if(p(e)){var g="function"==typeof e.item||"string"==typeof e.item;break a}if("function"===typeof e){g="function"==typeof e.item;break a}}g=!1}z(g?va(e):e,d)}}};var K=function(){this.h=null;this.C=!1;this.g=Lb("VIDEO")};K.prototype.I=function(){};K.prototype.play=function(){};var Mb=function(a,b){a.o=b};K.prototype.G=function(){};K.prototype.show=function(){this.g.style.display="block"};K.prototype.J=function(){this.g.setAttribute("controls",!0)};K.prototype.H=function(){this.g.removeAttribute("controls")};var Nb=function(){this.type=this.h=null;this.g=this.j=this.l=this.i="";this.m=0};var L=function(){K.call(this);var a=this;this.g=J("hls-content")||Lb("VIDEO");this.l=new Hls({autoStartLoad:!1});this.g.addEventListener("seeked",function(){if("live"!=a.j)if(a.i)a.i=!1;else{var b=a.g.currentTime,c=a.h.previousCuePointForStreamTime(b);c&&!c.played&&(a.i=!0,a.m=b,a.g.currentTime=c.start)}});this.l.on(Hls.Events.FRAG_PARSING_METADATA,function(b,c){a.h&&c&&c.samples.forEach(function(d){a.h.processMetadata("ID3",d.data,d.pts)})})};k(L,K);
  L.prototype.I=function(a,b){var c=this;this.j=b;this.l.on(Hls.Events.MEDIA_ATTACHED,function(){c.l.loadSource(a);c.l.on(Hls.Events.MANIFEST_PARSED,function(){c.o()})});this.l.attachMedia(this.g)};L.prototype.play=function(a){var b=0;a&&(b=this.h.streamTimeForContentTime(a),this.i=!0);this.l.startLoad(b);this.g.setAttribute("controls",!0);this.g.play()};L.prototype.G=function(){this.g.pause();this.g.src="";this.g.style.display="none"};var Ob=function(){K.call(this);this.g=J("hls-content")||Lb("VIDEO")};k(Ob,K);h=Ob.prototype;h.ia=function(a){var b=this,c=a.track;"metadata"===c.kind&&(c.mode="hidden",c.ka=function(){var d=c.activeCues;var f="undefined"!=typeof Symbol&&Symbol.iterator&&d[Symbol.iterator];d=f?f.call(d):{next:aa(d)};for(f=d.next();!f.done;f=d.next()){f=f.value;var e={};e[f.value.key]=f.value.data;b.h.onTimedMetadata(e)}})};
  h.aa=function(){if("live"!=this.j)if(this.i)this.i=!1;else{var a=this.g.currentTime,b=this.h.previousCuePointForStreamTime(a);b&&!b.played&&(this.i=!0,this.m=a,this.g.currentTime=b.start)}};h.I=function(a,b){var c=this;this.j=b;this.g.addEventListener("loadedmetadata",function(){c.o()});this.g.src=a;this.g.onseeked=this.aa.bind(this);this.g.textTracks.onaddtrack=this.ia.bind(this)};
  h.play=function(a){a&&(a=this.h.streamTimeForContentTime(a),this.i=!0,this.g.currentTime=a);this.g.setAttribute("controls",!0);this.g.play()};h.G=function(){this.g.src="";this.g.style.display="none"};var Pb=J("play-button"),Qb=!1,Rb=!1,Sb=function(){K.call(this);var a=this;this.g=J("dash-content")||Lb("VIDEO");shaka.polyfill.installAll();this.l=new shaka.Player(this.g);this.l.addEventListener("emsg",function(b){a.h.onTimedMetadata({TXXX:b.detail.messageData})});this.l.addEventListener("timelineregionenter",function(b){a.h.onTimedMetadata({TXXX:b.detail.eventElement.attributes.messageData.nodeValue})});this.g.addEventListener("seeked",this.ba.bind(this))};k(Sb,K);h=Sb.prototype;
  h.ba=function(){if("live"!=this.j)if(this.i)this.i=!1;else{var a=this.g.currentTime,b=this.h.previousCuePointForStreamTime(a);b&&!b.played&&(this.i=!0,this.m=a,this.g.currentTime=b.start)}};h.I=function(a,b){var c=this;this.j=b;"live"==this.j?this.H():this.J();this.l.load(a).then(function(){c.o()})};
  h.play=function(a){if(Qb&&"live"==this.j)Rb?(this.g.pause(),I(Pb,H("Play")),Rb=!1):(this.g.play(),I(Pb,H("Pause")),Rb=!0);else{var b=0;Qb=!0;a&&(b=this.h.streamTimeForContentTime(a),this.i=!0);this.g.currentTime=b;this.g.play();"live"==this.j&&(I(Pb,H("Pause")),Rb=!0)}};h.G=function(){this.l.unload();this.g.style.display="none"};h.J=function(){"live"!=this.j&&this.g.setAttribute("controls",!0)};h.H=function(){this.g.removeAttribute("controls")};var Tb=function(){this.i=this.l=this.g=this.j=this.h=null},Ub=function(a,b){a.l=b},Vb=function(a){a.i=new google.ima.dai.api.StreamManager(a.h.g,a.j);a.i.addEventListener([google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED,google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,google.ima.dai.api.StreamEvent.Type.AD_PROGRESS,google.ima.dai.api.StreamEvent.Type.CLICK,google.ima.dai.api.StreamEvent.Type.COMPLETE,google.ima.dai.api.StreamEvent.Type.CUEPOINTS_CHANGED,google.ima.dai.api.StreamEvent.Type.ERROR,
  google.ima.dai.api.StreamEvent.Type.FIRST_QUARTILE,google.ima.dai.api.StreamEvent.Type.LOADED,google.ima.dai.api.StreamEvent.Type.MIDPOINT,google.ima.dai.api.StreamEvent.Type.STARTED,google.ima.dai.api.StreamEvent.Type.STREAM_INITIALIZED,google.ima.dai.api.StreamEvent.Type.THIRD_QUARTILE],function(b){switch(b.type){case google.ima.dai.api.StreamEvent.Type.LOADED:a.h.I(b.getStreamData().url,a.g.type);break;case google.ima.dai.api.StreamEvent.Type.ERROR:a.h.I("http://storage.googleapis.com/testtopbox-public/video_content/bbb/master.m3u8",
  "vod");break;case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:var c=a.h;c.C=!0;c.H();break;case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:c=a.h,c.C=!1,c.J(),c.m&&c.m>c.g.currentTime&&(c.g.currentTime=c.m,c.m=null)}a.l(b)})},Wb=function(a,b,c){a.h=b;a.g=c;a.i?a.i.reset():Vb(a);a.h.h=a.i;"live"==a.g.type?(b=new google.ima.dai.api.LiveStreamRequest,b.format=a.g.h,b.assetKey=a.g.i,b.apiKey=a.g.g):(b=new google.ima.dai.api.VODStreamRequest,b.format=a.g.h,b.contentSourceId=a.g.l,b.videoId=
  a.g.j,b.apiKey=a.g.g);a.i.requestStream(b)};var Xb=function(a,b){this.g=a[l.Symbol.iterator]();this.h=b;this.i=0};Xb.prototype[Symbol.iterator]=function(){return this};Xb.prototype.next=function(){var a=this.g.next();return{value:a.done?void 0:this.h.call(void 0,a.value,this.i++),done:a.done}};var Yb=function(a,b){return new Xb(a,b)};var Zb="StopIteration"in l?l.StopIteration:{message:"StopIteration",stack:""},M=function(){};M.prototype.next=function(){throw Zb;};M.prototype.A=function(){return this};var ac=function(a){if(a instanceof N||a instanceof O||a instanceof P)return a;if("function"==typeof a.next)return new N(function(){return $b(a)});if("function"==typeof a[Symbol.iterator])return new N(function(){return a[Symbol.iterator]()});if("function"==typeof a.A)return new N(function(){return $b(a.A())});throw Error("Not an iterator or iterable.");},$b=function(a){if(!(a instanceof M))return a;var b=!1;return{next:function(){for(var c;!b;)try{c=a.next();break}catch(d){if(d!==Zb)throw d;b=!0}return{value:c,
  done:b}}}},N=function(a){this.g=a};N.prototype.A=function(){return new O(this.g())};N.prototype[Symbol.iterator]=function(){return new P(this.g())};N.prototype.h=function(){return new P(this.g())};var O=function(a){this.g=a};k(O,M);O.prototype.next=function(){var a=this.g.next();if(a.done)throw Zb;return a.value};O.prototype[Symbol.iterator]=function(){return new P(this.g)};O.prototype.h=function(){return new P(this.g)};var P=function(a){N.call(this,function(){return a});this.i=a};k(P,N);
  P.prototype.next=function(){return this.i.next()};var Q=function(a,b){this.h={};this.g=[];this.i=this.size=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1])}else if(a)if(a instanceof Q)for(c=a.D(),d=0;d<c.length;d++)this.set(c[d],a.get(c[d]));else for(d in a)this.set(d,a[d])};Q.prototype.F=function(){bc(this);for(var a=[],b=0;b<this.g.length;b++)a.push(this.h[this.g[b]]);return a};Q.prototype.D=function(){bc(this);return this.g.concat()};
  Q.prototype.has=function(a){return R(this.h,a)};var bc=function(a){if(a.size!=a.g.length){for(var b=0,c=0;b<a.g.length;){var d=a.g[b];R(a.h,d)&&(a.g[c++]=d);b++}a.g.length=c}if(a.size!=a.g.length){var f={};for(c=b=0;b<a.g.length;)d=a.g[b],R(f,d)||(a.g[c++]=d,f[d]=1),b++;a.g.length=c}};h=Q.prototype;h.get=function(a,b){return R(this.h,a)?this.h[a]:b};h.set=function(a,b){R(this.h,a)||(this.size+=1,this.g.push(a),this.i++);this.h[a]=b};
  h.forEach=function(a,b){for(var c=this.D(),d=0;d<c.length;d++){var f=c[d],e=this.get(f);a.call(b,e,f,this)}};h.keys=function(){return ac(this.A(!0)).h()};h.values=function(){return ac(this.A(!1)).h()};h.entries=function(){var a=this;return Yb(this.keys(),function(b){return[b,a.get(b)]})};h.A=function(a){bc(this);var b=0,c=this.i,d=this,f=new M;f.next=function(){if(c!=d.i)throw Error("The map has changed since the iterator was created");if(b>=d.g.length)throw Zb;var e=d.g[b++];return a?e:d.h[e]};return f};
  var R=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)};var cc=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^\\/?#]*)@)?([^\\/?#]*?)(?::([0-9]+))?(?=[\\/?#]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/,dc=function(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),f=null;if(0<=d){var e=a[c].substring(0,d);f=a[c].substring(d+1)}else e=a[c];b(e,f?decodeURIComponent(f.replace(/\+/g," ")):"")}}};var ec=function(a){this.j=this.u=this.i="";this.o=null;this.l=this.m="";this.h=!1;if(a instanceof ec){this.h=a.h;fc(this,a.i);this.u=a.u;this.j=a.j;gc(this,a.o);this.m=a.m;var b=a.g;var c=new S;c.i=b.i;b.g&&(c.g=new Q(b.g),c.h=b.h);hc(this,c);this.l=a.l}else a&&(b=String(a).match(cc))?(this.h=!1,fc(this,b[1]||"",!0),this.u=T(b[2]||""),this.j=T(b[3]||"",!0),gc(this,b[4]),this.m=T(b[5]||"",!0),hc(this,b[6]||"",!0),this.l=T(b[7]||"")):(this.h=!1,this.g=new S(null,this.h))};
  ec.prototype.toString=function(){var a=[],b=this.i;b&&a.push(U(b,ic,!0),":");var c=this.j;if(c||"file"==b)a.push("//"),(b=this.u)&&a.push(U(b,ic,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.o,null!=c&&a.push(":",String(c));if(c=this.m)this.j&&"/"!=c.charAt(0)&&a.push("/"),a.push(U(c,"/"==c.charAt(0)?jc:kc,!0));(c=this.g.toString())&&a.push("?",c);(c=this.l)&&a.push("#",U(c,lc));return a.join("")};
  var fc=function(a,b,c){a.i=c?T(b,!0):b;a.i&&(a.i=a.i.replace(/:$/,""))},gc=function(a,b){if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.o=b}else a.o=null},hc=function(a,b,c){b instanceof S?(a.g=b,mc(a.g,a.h)):(c||(b=U(b,nc)),a.g=new S(b,a.h))},T=function(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""},U=function(a,b,c){return"string"===typeof a?(a=encodeURI(a).replace(b,oc),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null},oc=function(a){a=
  a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)},ic=/[#\/\?@]/g,kc=/[#\?:]/g,jc=/[#\?]/g,nc=/[#\?@]/g,lc=/#/g,S=function(a,b){this.h=this.g=null;this.i=a||null;this.j=!!b},V=function(a){a.g||(a.g=new Q,a.h=0,a.i&&dc(a.i,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c)}))};S.prototype.add=function(a,b){V(this);this.i=null;a=W(this,a);var c=this.g.get(a);c||this.g.set(a,c=[]);c.push(b);this.h=x(this.h)+1;return this};
  var pc=function(a,b){V(a);b=W(a,b);a.g.has(b)&&(a.i=null,a.h=x(a.h)-a.g.get(b).length,a=a.g,R(a.h,b)&&(delete a.h[b],--a.size,a.i++,a.g.length>2*a.size&&bc(a)))},qc=function(a,b){V(a);b=W(a,b);return a.g.has(b)};h=S.prototype;h.forEach=function(a,b){V(this);this.g.forEach(function(c,d){z(c,function(f){a.call(b,f,d,this)},this)},this)};h.D=function(){V(this);for(var a=this.g.F(),b=this.g.D(),c=[],d=0;d<b.length;d++)for(var f=a[d],e=0;e<f.length;e++)c.push(b[d]);return c};
  h.F=function(a){V(this);var b=[];if("string"===typeof a)qc(this,a)&&(b=ua(b,this.g.get(W(this,a))));else{a=this.g.F();for(var c=0;c<a.length;c++)b=ua(b,a[c])}return b};h.set=function(a,b){V(this);this.i=null;a=W(this,a);qc(this,a)&&(this.h=x(this.h)-this.g.get(a).length);this.g.set(a,[b]);this.h=x(this.h)+1;return this};h.get=function(a,b){if(!a)return b;a=this.F(a);return 0<a.length?String(a[0]):b};
  h.toString=function(){if(this.i)return this.i;if(!this.g)return"";for(var a=[],b=this.g.D(),c=0;c<b.length;c++){var d=b[c],f=encodeURIComponent(String(d));d=this.F(d);for(var e=0;e<d.length;e++){var g=f;""!==d[e]&&(g+="="+encodeURIComponent(String(d[e])));a.push(g)}}return this.i=a.join("&")};
  var W=function(a,b){b=String(b);a.j&&(b=b.toLowerCase());return b},mc=function(a,b){b&&!a.j&&(V(a),a.i=null,a.g.forEach(function(c,d){var f=d.toLowerCase();d!=f&&(pc(this,d),pc(this,f),0<c.length&&(this.i=null,this.g.set(W(this,f),va(c)),this.h=x(this.h)+c.length))},a));a.j=b};var vc=function(a){var b=this;this.T=new Tb;this.h=rc(this);this.g=rc(this);this.K=J("live-radio");this.da=J("sample-live-link");this.Y=J("live-inputs");this.$=J("vod-inputs");this.O=J("vod-radio");this.ha=J("sample-vod-link");this.u=J("asset-key");this.X=J("live-api-key");this.l=J("cms-id");this.o=J("video-id");this.Z=J("vod-api-key");this.ga=J("stream-formats");this.m=J("hls-radio");this.P=J("dash-radio");this.i=J("ad-ui");this.ea=J("load-button");this.S=J("play-button");this.M=J("bookmark-button");
  this.V=J("bookmark-wrapper");this.ca=J("bookmark-link-text");this.N=J("console");this.R=a;this.fa=sc(this);this.L=[];tc(this,this.R);this.T.j=this.i;Ub(this.T,function(c){c.type!=google.ima.dai.api.StreamEvent.Type.AD_PROGRESS&&b.log("Stream event: "+c.type);switch(c.type){case google.ima.dai.api.StreamEvent.Type.ERROR:b.log("Stream error: "+c.getStreamData().errorMessage);break;case google.ima.dai.api.StreamEvent.Type.LOADED:b.log("Stream ID: "+c.getStreamData().streamId);break;case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:b.i.style.display=
  "block";break;case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:b.i.style.display="none"}});uc(this)},tc=function(a,b){if(b){var c=new ec(b);b=c.g.get("streamType");var d=c.g.get("streamFormat"),f=c.g.get("assetKey"),e=c.g.get("apiKey"),g=c.g.get("cmsId");c=c.g.get("videoId");b&&("live"===b.toLowerCase()?(a.O.checked=!1,a.K.checked=!0,wc(a),e&&(a.X.value=e)):"vod"===b.toLowerCase()&&(a.O.checked=!0,a.K.checked=!1,xc(a),e&&(a.Z.value=e)));d&&("hls"===d.toLowerCase()?(a.P.checked=!1,a.m.checked=
  !0,yc(a)):"dash"===d.toLowerCase()&&(a.P.checked=!0,a.m.checked=!1,zc(a)));f&&(a.u.value=f);g&&(a.l.value=g);c&&(a.o.value=c)}},rc=function(a){if(!a.h){B("Safari")&&!((B("Chrome")||B("CriOS"))&&!B("Edge")||B("Coast")||B("Opera")||B("Edge")||B("Edg/")||B("OPR")||B("Firefox")||B("FxiOS")||B("Silk")||B("Android"))||B("iPhone")&&!B("iPod")&&!B("iPad")||B("iPad")||B("iPod")?a.h=new Ob:a.h=new L;var b=a.h.g;b.addEventListener("pause",function(){var c=a.h;c.C&&(c.J(),a.i.style.display="none")});b.addEventListener("play",
  function(){var c=a.h;c.C&&(c.H(),a.i.style.display="block")})}return a.h},Ac=function(a){if(!a.j){a.j=new Sb;var b=a.j.g;b.addEventListener("pause",function(){var c=a.j;c.C&&(c.J(),a.i.style.display="none")});b.addEventListener("play",function(){var c=a.j;c.C&&(c.H(),a.i.style.display="block")})}return a.j},sc=function(a){var b={};a=a.R.split("?")[1];if(!a)return b;a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].split("=");b[d[0]]=decodeURIComponent(d[1])}return b},uc=function(a){a.K.addEventListener("click",
  function(){return wc(a)});a.O.addEventListener("click",function(){return xc(a)});a.da.addEventListener("click",function(){return Bc(a)});a.ha.addEventListener("click",function(){return Cc(a)});a.m.addEventListener("click",function(){return yc(a)});a.P.addEventListener("click",function(){return zc(a)});a.ea.addEventListener("click",function(){return Dc(a)});a.S.addEventListener("click",function(){a.g.play(Ec(a))});a.M.addEventListener("click",function(){if(a.g.g.currentTime){var b=a.g;b=Math.floor(b.h.contentTimeForStreamTime(b.g.currentTime));
  b=a.R.split("?")[0]+"?bookmark="+b}else b="Error: could not get current time of video element, or current time is 0";a.ca.value=b;a.V.style.display="block"});a.ga.style.display="block"},wc=function(a){a.$.style.display="none";a.Y.style.display="block";Fc(a)},xc=function(a){a.Y.style.display="none";a.$.style.display="block";Fc(a)},Fc=function(a){a.i.style.display="none";a.S.setAttribute("disabled",!0);a.M.setAttribute("disabled",!0)},Bc=function(a){a.u.value=a.m.checked?"sN_IYUG8STe1ZzhIIE_ksA":"PSzZMzAkSXCmlJOWDmRj8Q";
  wc(a)},Cc=function(a){a.m.checked?(a.l.value="2528370",a.o.value="tears-of-steel"):(a.l.value="2559737",a.o.value="tos-dash");xc(a)},yc=function(a){a.K.removeAttribute("disabled");a.j&&a.j.G();Fc(a);a.O.checked&&"2559737"==a.l.value&&"tos-dash"==a.o.value?Cc(a):"PSzZMzAkSXCmlJOWDmRj8Q"==a.u.value&&Bc(a);a.g=rc(a);a.g.show()},zc=function(a){a.h.G();Fc(a);"2528370"==a.l.value&&"tears-of-steel"==a.o.value?Cc(a):"sN_IYUG8STe1ZzhIIE_ksA"==a.u.value&&Bc(a);a.g=Ac(a);a.g.show()},Dc=function(a){a.W=Gc(a);
  Mb(a.g,function(){"live"==a.W.type?(a.M.setAttribute("disabled",!0),a.V.style.display="none"):a.M.removeAttribute("disabled");a.S.removeAttribute("disabled")});Wb(a.T,a.g,a.W);Hc(a)},Gc=function(a){var b=new Nb;b.h=a.m.checked?"hls":"dash";a.K.checked?(b.type="live",b.i=a.u.value,b.g=a.X.value):(b.type="vod",b.l=a.l.value,b.j=a.o.value,b.g=a.Z.value,b.m=Ec(a));return b},Ec=function(a){a=parseInt(a.fa.bookmark,10);return isNaN(a)?0:a},Hc=function(a){a.L.length=0;I(a.N,lb)};
  vc.prototype.log=function(a){if(!ib.test("span"))throw Error("Invalid tag name <span>.");if("SPAN"in kb)throw Error("Tag name <span> is not allowed for SafeHtml.");var b={};var c=null,d="";if(b)for(v in b)if(Object.prototype.hasOwnProperty.call(b,v)){if(!ib.test(v))throw Error('Invalid attribute name "'+v+'".');var f=b[v];if(null!=f){var e=v;var g=f;if(g instanceof C)g=Na(g);else if("style"==e.toLowerCase()){f=void 0;if(!p(g))throw Error('The "style" attribute requires goog.html.SafeStyle or map of style properties, '+
  typeof g+" given: "+g);if(!(g instanceof E)){var m="";for(f in g)if(Object.prototype.hasOwnProperty.call(g,f)){if(!/^[-_a-zA-Z0-9]+$/.test(f))throw Error("Name allows only [-_a-zA-Z0-9], got: "+f);var y=g[f];null!=y&&(y=Array.isArray(y)?ta(y,$a).join(" "):$a(y),m+=f+":"+y+";")}g=m?new E(m,Xa):Ya}g instanceof E&&g.constructor===E?f=g.g:(w("expected object of type SafeStyle, got '"+g+"' of type "+n(g)),f="type_error:SafeStyle");g=f}else{if(/^on/i.test(e))throw Error('Attribute "'+e+'" requires goog.string.Const value, "'+
  g+'" given.');if(e.toLowerCase()in jb)if(g instanceof Pa)g instanceof Pa&&g.constructor===Pa?f=g.g:(w("expected object of type TrustedResourceUrl, got '"+g+"' of type "+n(g)),f="type_error:TrustedResourceUrl"),g=f.toString();else if(g instanceof D)g=Ra(g);else if("string"===typeof g)g=(Va(g)||Wa).s();else throw Error('Attribute "'+e+'" on tag "span" requires goog.html.SafeUrl, goog.string.Const, or string, value "'+g+'" given.');}g.v&&(g=g.s());u("string"===typeof g||"number"===typeof g,"String or number value expected, got "+
  typeof g+" with value: "+g);e=e+'="'+Da(String(g))+'"';d+=" "+e}}var v="<span"+d;null==a?a=[]:Array.isArray(a)||(a=[a]);!0===Ja.span?(u(!a.length,"Void tag <span> does not allow content."),v+=">"):(c=nb(a),v+=">"+G(c).toString()+"</span>",c=c.B());(b=b&&b.dir)&&(/^(ltr|rtl|auto)$/i.test(b)?c=0:c=null);b=hb(v,c);0==this.L.length?this.L.push(b):this.L.push(nb(ob,b));I(this.N,nb.apply(this,this.L));this.N.scrollTop=this.N.scrollHeight};var X=["Controller"],Y=l;
  X[0]in Y||"undefined"==typeof Y.execScript||Y.execScript("var "+X[0]);for(var Z;X.length&&(Z=X.shift());)X.length||void 0===vc?Y[Z]&&Y[Z]!==Object.prototype[Z]?Y=Y[Z]:Y=Y[Z]={}:Y[Z]=vc;}).call(this);
  })();