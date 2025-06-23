const h={UMI:"admin/content/sitetree/",EzPro:"ezpro/",Bitrix:"bitrix/admin/#authorize",ABO:"login.php",MODX:"manager/",AdminLTE:"admin/",Joomla:"administrator/"},m=(t,n,o)=>{switch(o){case"Своя":case"WordPress":return`https://${n}`;case"Тильда":return"https://tilda.ru/login/";default:return`https://${t}/${h[o]}`}};let s=null,e=null,i=null;const d="projectsState",w=t=>chrome.runtime.getURL(`/assets/icons/${t.toLowerCase()}.svg`),c=async()=>{try{const t=await chrome.storage.local.get([d]);return t[d]!==void 0?JSON.parse(t[d]):null}catch(t){return console.error("Ошибка при получении из хранилища:",t),null}},y=async t=>{try{await chrome.storage.local.set({[d]:JSON.stringify(t)})}catch(n){console.error("Ошибка при сохранении в хранилище:",n)}},x=async()=>{if(s=await c(),!s)return;const t=new URL(window.location.href).hostname;e=s.projects.find(n=>n.url?t.includes(n.url):!1)||null,e&&f()},f=()=>{i=document.createElement("div"),i.id="sup-5th-widget",i.title=(e==null?void 0:e.cms)||"Проект",i.innerHTML=`
    <img src="${w((e==null?void 0:e.cms)||"cms")}" class="widget-icon">
  `;const t=document.createElement("style");t.textContent=`
    #sup-5th-widget {
      --x: 0;
      --y: 0;
      --width: 0;
      --height: 0;
      --translate: translate(min(max(var(--x), calc((100dvw - var(--width) - 46px) * -1)), 0dvw), min(max(var(--y), calc((100dvh - var(--height) - 46px) * -1)), 0dvh));
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 1000000000000;
      background: rgb(255 255 255 / .9);
      border-radius: 16px;
      padding: 10px;
      user-select: none;
      font-size: 14px;
      transform: var(--translate);
      font-family: Arial, sans-serif;
      box-shadow: 0 0 11px 2px rgb(0 0 0 / .2);
      transition: transform .23s;
      cursor: pointer;
    }
    
    #sup-5th-widget:not(.dragging):hover {
      transform: var(--translate) scale(1.05);
    }
    
    #sup-5th-widget .widget-icon {
      width: 48px;
      pointer-events: none;
    }

    
    #sup-5th-widget.dragging {
      transition: none;
      opacity: 0.8;
      background: #ef3e2c;
      cursor: grabbing;
    }
  `,document.head.appendChild(t);const n=(e==null?void 0:e.widgetPosition)||{x:0};i.style.setProperty("--x",`${n.x}dvw`),i.style.setProperty("--y",`${n.x}dvh`),v(i),i.addEventListener("click",L),document.body.appendChild(i),i.style.setProperty("--width",`${i.clientWidth}px`),i.style.setProperty("--height",`${i.clientHeight}px`)},v=t=>{let n=!1,o=0,g=0,a=null;const l=()=>{const r=window.getComputedStyle(t);return{x:parseInt(r.getPropertyValue("--x")),y:parseInt(r.getPropertyValue("--y"))}};t.addEventListener("mousedown",r=>{a&&clearTimeout(a),a=setTimeout(()=>{n=!0,t.classList.add("dragging");const{x:p,y:u}=l();o=r.pageX-p/100*window.innerWidth,g=r.pageY-u/100*window.innerHeight},500)}),document.body.addEventListener("mouseup",async()=>{a&&clearTimeout(a),n=!1,t.classList.remove("dragging"),e&&(e.widgetPosition=l(),await b())}),document.body.addEventListener("mousemove",r=>{n&&(t.style.setProperty("--x",`${(o-r.pageX)*-100/window.innerWidth}dvw`),t.style.setProperty("--y",`${(g-r.pageY)*-100/window.innerHeight}dvh`))})};async function b(){s=await c(),s&&(s.projects=s.projects.map(t=>t.url===(e==null?void 0:e.url)?{...t,widgetPosition:e==null?void 0:e.widgetPosition}:t),await y(s))}function L(t){t.target===t.currentTarget&&e&&window.open(m(e.url,e.urlAdmin,e.cms)||"","_blank")}x();
