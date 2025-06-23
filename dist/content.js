const h={UMI:"admin/content/sitetree/",EzPro:"ezpro/",Bitrix:"bitrix/admin/#authorize",ABO:"login.php",MODX:"manager/",AdminLTE:"admin/",Joomla:"administrator/"},w=(t,e)=>{switch(e){case"Своя":case"WordPress":return`https://${t}`;case"Тильда":return"https://tilda.ru/login/";default:return`/${h[e]}`}},c=(t,e={})=>{if(!t)return 0;let n=Math.trunc(t);return e.min!==void 0&&(n=Math.max(n,e.min)),e.max!==void 0&&(n=Math.min(n,e.max)),n};let r=null,i=null,o=null;const d="projectsState",y=t=>chrome.runtime.getURL(`/assets/icons/${t.toLowerCase()}.svg`),u=async()=>{try{const t=await chrome.storage.local.get([d]);return t[d]!==void 0?JSON.parse(t[d]):null}catch(t){return console.error("Ошибка при получении из хранилища:",t),null}},x=async t=>{try{await chrome.storage.local.set({[d]:JSON.stringify(t)})}catch(e){console.error("Ошибка при сохранении в хранилище:",e)}},f=async()=>{if(r=await u(),!r)return;const t=new URL(window.location.href).hostname;i=r.projects.find(e=>e.url?e.subdomain?t.includes(e.url):t===e.url:!1)||null,i&&v()},v=()=>{o=document.createElement("div"),o.id="sup-5th-widget",o.title=(i==null?void 0:i.cms)||"Проект",o.innerHTML=`
    <img src="${y((i==null?void 0:i.cms)||"cms")}" class="widget-icon">
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
  `,document.head.appendChild(t);const e=(i==null?void 0:i.widgetPosition)||{x:0,y:0};o.style.setProperty("--x",`${e.x}dvw`),o.style.setProperty("--y",`${e.y}dvh`),b(o),document.body.appendChild(o),o.style.setProperty("--width",`${o.clientWidth}px`),o.style.setProperty("--height",`${o.clientHeight}px`)},b=t=>{let e=!1,n=0,g=0,a=null;const l=()=>{const s=window.getComputedStyle(t);return{x:parseInt(s.getPropertyValue("--x")),y:parseInt(s.getPropertyValue("--y"))}};t.addEventListener("mousedown",s=>{a&&clearTimeout(a),a=setTimeout(()=>{e=!0,t.classList.add("dragging");const{x:m,y:p}=l();n=s.pageX-m/100*window.innerWidth,g=s.pageY-p/100*window.innerHeight},500)}),document.body.addEventListener("mouseup",async s=>{a&&(clearTimeout(a),i&&!e&&s.button===0&&window.open(w(i.urlAdmin,i.cms)||"","_blank")),e=!1,t.classList.remove("dragging"),i&&(i.widgetPosition=l(),await L())}),document.body.addEventListener("mousemove",s=>{e&&(t.style.setProperty("--x",`${c((n-s.pageX)*-100/window.innerWidth,{min:-99,max:0})}dvw`),t.style.setProperty("--y",`${c((g-s.pageY)*-100/window.innerHeight,{min:-99,max:0})}dvh`))})};async function L(){var e;if(r=await u(),!r)return;let t;i!=null&&i.widgetPosition&&(i.widgetPosition.x||(e=i.widgetPosition)!=null&&e.y)&&(t=i.widgetPosition),r.projects=r.projects.map(n=>n.url===(i==null?void 0:i.url)?{...n,widgetPosition:t}:n),await x(r)}f();
