import{s as u,b as h}from"./alerts-tQwHGxFb.js";import{a as p,i as b,h as f}from"./layout-EwC_OHfV.js";import{i as l,f as m,a as g,c as x}from"./formatters-BEJSvjhS.js";p();async function n(a,t,o,r,i=null){let e=u.from(a).select("id",{count:"exact",head:!0});e=i?e.gte(t,r).lte(t,i):e[o](t,r);const{count:s,error:c}=await e;if(c)throw c;return s||0}function d(a,t,o,r){return`
    <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-300">${a}</p>
        <span class="rounded-lg ${r} p-2 text-white">${f(o)}</span>
      </div>
      <p class="mt-4 text-3xl font-bold text-slate-900 dark:text-white">${t}</p>
    </article>
  `}async function v(){try{const[a,t,o,r]=await Promise.all([n("movimentacoes","status","eq","aberta"),n("clientes","ativo","eq",!0),n("movimentacoes","data_hora_entrada","gte",l(),m()),n("movimentacoes","data_hora_saida","gte",l(),m())]);document.querySelector("#cardsResumo").innerHTML=[d("Veículos no pátio",a,"truck","bg-primary"),d("Mensalistas ativos",t,"users","bg-emerald-600"),d("Entradas hoje",o,"plus","bg-amber-500"),d("Saídas hoje",r,"arrowRight","bg-red-600")].join("");const{data:i,error:e}=await u.from("movimentacoes").select("id, data_hora_entrada, status, veiculos(placa, clientes(nome))").order("data_hora_entrada",{ascending:!1}).limit(5);if(e)throw e;document.querySelector("#tabelaRecentes").innerHTML=i.length?i.map(s=>`
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
          <td>${s.veiculos?.placa||"-"}</td>
          <td>${s.veiculos?.clientes?.nome||"Avulso"}</td>
          <td>${g(s.data_hora_entrada)}</td>
          <td><span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold dark:bg-slate-800">${x(s.status)}</span></td>
        </tr>`).join(""):'<tr><td colspan="4" class="text-center">Não há movimentações recentes.</td></tr>'}catch(a){await h("Erro ao carregar dashboard",a)}}const w=await b({titulo:"Dashboard"});w&&await v();
