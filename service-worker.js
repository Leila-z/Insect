!function(){"use strict";const s=1623235281192,t=`cache${s}`,e=["/client/client.74c249d1.js","/client/inject_styles.5607aec6.js","/client/index.51543594.js"].concat(["/service-worker-index.html","/assets/contact/5.jpg","/assets/contact/back.png","/assets/contact/background.png","/assets/contact/instagram.png","/assets/contact/mobile.png","/assets/contact/phone.png","/assets/contact/telegram.png","/assets/contact/telephone.png","/assets/contact/whatsapp.png","/assets/icons/1.png","/assets/icons/2.png","/assets/icons/3.png","/assets/icons/4.png","/assets/icons/back.png","/assets/icons/contact.png","/assets/insects/1.jpeg","/assets/insects/2.jpeg","/assets/insects/3.jpg","/assets/insects/4.jpeg","/assets/insects/6.jpeg","/assets/insects/7.jpeg","/assets/insects/info-1.png","/assets/insects/info-2.png","/assets/logo.svg","/assets/slide/Bee-black.png","/assets/slide/Bee.png","/assets/slide/bug.png","/assets/slide/butterfly-blue.png","/assets/slide/butterfly.png","/assets/slide/Dragonfly.png","/assets/slide/grass.png","/assets/slide/home.jpg","/assets/slide/man.png","/assets/slide/red-bug.png","/build/bundle.js","/build/bundle.js.map","/favicon.png","/fonts/dana-black.eot","/fonts/dana-black.woff","/fonts/dana-black.woff2","/fonts/dana-bold.eot","/fonts/dana-bold.woff","/fonts/dana-bold.woff2","/fonts/dana-light.eot","/fonts/dana-light.woff","/fonts/dana-light.woff2","/fonts/dana-thin.eot","/fonts/dana-thin.woff","/fonts/dana-thin.woff2","/manifest.json","/styles/all.css","/styles/fonts.css","/styles/main.css","/styles/reset.css","/styles/variables.css"]),n=new Set(e);self.addEventListener("install",(s=>{s.waitUntil(caches.open(t).then((s=>s.addAll(e))).then((()=>{self.skipWaiting()})))})),self.addEventListener("activate",(s=>{s.waitUntil(caches.keys().then((async s=>{for(const e of s)e!==t&&await caches.delete(e);self.clients.claim()})))})),self.addEventListener("fetch",(t=>{if("GET"!==t.request.method||t.request.headers.has("range"))return;const e=new URL(t.request.url),a=e.protocol.startsWith("http"),c=e.hostname===self.location.hostname&&e.port!==self.location.port,o=e.host===self.location.host&&n.has(e.pathname),i="only-if-cached"===t.request.cache&&!o;!a||c||i||t.respondWith((async()=>o&&await caches.match(t.request)||async function(t){const e=await caches.open(`offline${s}`);try{const s=await fetch(t);return e.put(t,s.clone()),s}catch(s){const n=await e.match(t);if(n)return n;throw s}}(t.request))())}))}();
