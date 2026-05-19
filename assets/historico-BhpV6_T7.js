import{s as p,b as _}from"./alerts-tQwHGxFb.js";import{a as h,i as g}from"./layout-EwC_OHfV.js";import{n as y,a as u,b,c as q}from"./formatters-BEJSvjhS.js";import{i as S,r as $}from"./pagination-D6lWDrZW.js";h();let o=1;const m=10;async function e(){try{const{inicio:r,fim:f}=S(o,m),i=y(document.querySelector("#placa").value||""),c=document.querySelector("#inicio").value,s=document.querySelector("#fim").value,n=document.querySelector("#status").value;let a=p.from("movimentacoes").select("id, data_hora_entrada, data_hora_saida, valor_cobrado, status, veiculos!inner(placa, clientes(nome))",{count:"exact"}).order("data_hora_entrada",{ascending:!1}).range(r,f);i&&(a=a.ilike("veiculos.placa",`%${i}%`)),c&&(a=a.gte("data_hora_entrada",`${c}T00:00:00`)),s&&(a=a.lte("data_hora_entrada",`${s}T23:59:59`)),n&&(a=a.eq("status",n));const{data:l,count:v,error:d}=await a;if(d)throw d;document.querySelector("#tabelaHistorico").innerHTML=l.length?l.map(t=>`
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
          <td>${t.veiculos?.placa||"-"}</td>
          <td>${t.veiculos?.clientes?.nome||"Avulso"}</td>
          <td>${u(t.data_hora_entrada)}</td>
          <td>${u(t.data_hora_saida)}</td>
          <td>${b(t.valor_cobrado)}</td>
          <td>${q(t.status)}</td>
        </tr>`).join(""):'<tr><td colspan="6" class="text-center">Não há movimentações para os filtros atuais.</td></tr>',$(document.querySelector("#paginacao"),{pagina:o,total:v,tamanhoPagina:m,aoMudar:t=>{o=t,e()}})}catch(r){await _("Erro ao carregar histórico",r)}}const w=await g({titulo:"Histórico"});w&&(document.querySelector("#formFiltros").addEventListener("submit",r=>{r.preventDefault(),o=1,e()}),await e());
