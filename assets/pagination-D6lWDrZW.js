import{h as n}from"./layout-EwC_OHfV.js";function c(e,t){const r=(e-1)*t;return{inicio:r,fim:r+t-1}}function i(e,t){return Math.max(1,Math.ceil((e||0)/t))}function l(e,{pagina:t,total:r,tamanhoPagina:o,aoMudar:a}){const s=i(r,o);e.innerHTML=`
    <div class="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row">
      <p class="text-sm text-slate-600 dark:text-slate-300">Página ${t} de ${s} • ${r||0} registro(s)</p>
      <div class="flex gap-2">
        <button class="app-button-secondary" data-page="prev" type="button" ${t<=1?"disabled":""}>
          ${n("arrowLeft")} Anterior
        </button>
        <button class="app-button-secondary" data-page="next" type="button" ${t>=s?"disabled":""}>
          Próxima ${n("arrowRight")}
        </button>
      </div>
    </div>
  `,e.querySelector('[data-page="prev"]')?.addEventListener("click",()=>a(t-1)),e.querySelector('[data-page="next"]')?.addEventListener("click",()=>a(t+1))}export{c as i,l as r};
