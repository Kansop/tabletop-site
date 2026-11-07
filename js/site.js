// ===== WAITLIST SETUP: the ONE line to edit =====
// Waitlist signups are emailed through formsubmit.co to the address in this line.
var WAITLIST_ENDPOINT='https://formsubmit.co/ajax/lucabomfim3@gmail.com';
(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var burger=$('#burger'),nav=$('#nav');
if(burger&&nav){
 burger.addEventListener('click',function(){var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
 nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');burger.setAttribute('aria-expanded','false')}});
}
// Waitlist: posts to WAITLIST_ENDPOINT (set at the top of this file). Without JavaScript the form opens the visitor's email app instead.
var f=$('#wl');
if(f){
 var thanks=$('#thanks'),errBox=$('#wlerr'),btn=$('#wlbtn');
 var live=WAITLIST_ENDPOINT.indexOf('REPLACE_WITH')<0&&/^https?:\/\//.test(WAITLIST_ENDPOINT);
  var mailTo=(WAITLIST_ENDPOINT.split('/ajax/')[1]||'');mailTo=''; // no personal address shown on the site
 var showErr=function(msg){
  errBox.textContent='';errBox.appendChild(document.createTextNode(msg));
  if(mailTo){errBox.appendChild(document.createTextNode(' You can also email us at '));var a=document.createElement('a');a.href='mailto:'+mailTo+'?subject='+encodeURIComponent('TableTop product updates');a.textContent=mailTo;errBox.appendChild(a);errBox.appendChild(document.createTextNode('.'))}
  errBox.hidden=false;
 };
 var done=function(name){
  $('#tname').textContent=name?', '+name.split(' ')[0]:'';
  f.hidden=true;thanks.hidden=false;thanks.scrollIntoView({block:'center'});
 };
 f.addEventListener('submit',function(e){
  e.preventDefault();if(btn.disabled)return;
  errBox.hidden=true;var ok=true;
  ['wn','we'].forEach(function(id){var el=document.getElementById(id);var bad=!el.value.trim()||(el.type==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim()));el.classList.toggle('invalid',bad);if(bad)ok=false});
  if(!ok){var first=f.querySelector('.invalid');if(first)first.focus();return}
  if(!live){showErr('Sorry, the contact form is not set up yet. Please try again later.');return}
  var d={};
  new FormData(f).forEach(function(v,k){d[k]=String(v).slice(0,500)});
  d.name=(d.name||'').trim();d.email=(d.email||'').trim();
  if(d._honey){done(d.name);return} // bots fill the hidden field: pretend success, send nothing
  d._subject='TableTop website question';
  var label=btn.textContent;btn.disabled=true;btn.textContent='Sending...';
  var fail=function(){showErr('Sorry, that did not go through. Please check your connection and try again.')};
  var reset=function(){btn.disabled=false;btn.textContent=label};
  try{
   fetch(WAITLIST_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(d)})
   .then(function(r){return r.json().catch(function(){return {}}).then(function(j){
     if(r.ok&&j.success!==false&&j.success!=='false'){reset();done(d.name)}else{reset();fail()}})})
   .catch(function(){reset();fail()});
  }catch(err){reset();fail()}
 });
 f.addEventListener('input',function(e){e.target.classList.remove('invalid')});
 $('#againwl').addEventListener('click',function(){f.reset();errBox.hidden=true;f.hidden=false;thanks.hidden=true});
}
// Tour page: desktop/phone preview toggle
var dev=$('#dev');
if(dev){
 var bd=$('#bdesk'),bp=$('#bphone');
 function set(p){dev.classList.toggle('phone-w',p);bp.setAttribute('aria-pressed',p);bd.setAttribute('aria-pressed',!p)}
 bd.addEventListener('click',function(){set(false)});bp.addEventListener('click',function(){set(true)});
}
})();
// Visual only: fade-in on scroll (skipped if the visitor prefers reduced motion)
(function(){
 if(!('IntersectionObserver' in window)||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches))return;
 var els=document.querySelectorAll('main section h2,.card,.price,details,.formcard,.gallery figure,.phones img');
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);var t=e.target;setTimeout(function(){t.style.transitionDelay=''},1200)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 els.forEach(function(el,i){el.classList.add('rv');el.style.transitionDelay=(el.matches('.card')?(i%3)*80:0)+'ms';io.observe(el)});
})();
// Homepage phone bar: after the hero leaves the screen, and only while the layout is narrow.
(function(){
 var dock=document.getElementById('dock'),hero=document.querySelector('.hero');
 if(!dock||!hero||!window.IntersectionObserver||!window.matchMedia)return;
 var mq=window.matchMedia('(max-width:860px)'),heroOn=true,io;
 function sync(){
  var show=mq.matches&&!heroOn;
  dock.hidden=!show;
  document.body.classList.toggle('has-dock',show);
 }
 function watch(){
  if(io)io.disconnect();
  var top=document.querySelector('.top');
  var px=top?Math.ceil(top.getBoundingClientRect().height):0;
  io=new IntersectionObserver(function(es){heroOn=!!es[0].isIntersecting;sync()},{threshold:0,rootMargin:'-'+px+'px 0px 0px 0px'});
  io.observe(hero);
 }
 watch();
 if(mq.addEventListener)mq.addEventListener('change',sync);
 else if(mq.addListener)mq.addListener(sync);
 window.addEventListener('resize',watch);
})();
