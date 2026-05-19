import{s as u,b as m}from"./alerts-B41tt2c_.js";import{a as p,i as v}from"./layout-BAJKA9WQ.js";import{n as f,c as g,a as h}from"./formatters-BEJSvjhS.js";import{i as b,r as y}from"./pagination-D4fnk5D0.js";p();let t=1;const s=10;async function r(){try{const{inicio:o,fim:l}=b(t,s),c=f(document.querySelector("#buscaPlaca").value||"");let e=u.from("movimentacoes").select("id, data_hora_entrada, veiculos!inner(placa, tipo_cliente, marcas(nome), modelos(nome), clientes(nome))",{count:"exact"}).eq("status","aberta").order("data_hora_entrada",{ascending:!0}).range(o,l);c&&(e=e.ilike("veiculos.placa",`%${c}%`));const{data:i,count:d,error:n}=await e;if(n)throw n;document.querySelector("#tabelaPatio").innerHTML=i.length?i.map(a=>`
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
          <td>${a.veiculos?.placa||"-"}</td>
          <td>${a.veiculos?.marcas?.nome||"-"}</td>
          <td>${a.veiculos?.modelos?.nome||"-"}</td>
          <td>${a.veiculos?.clientes?.nome||"Avulso"}</td>
          <td>${g(a.veiculos?.tipo_cliente)}</td>
          <td>${h(a.data_hora_entrada)}</td>
        </tr>`).join(""):'<tr><td colspan="6" class="text-center">Não há veículos no pátio para os filtros atuais.</td></tr>',y(document.querySelector("#paginacao"),{pagina:t,total:d,tamanhoPagina:s,aoMudar:a=>{t=a,r()}})}catch(o){await m("Erro ao carregar pátio",o)}}const P=await v({titulo:"Pátio"});P&&(document.querySelector("#btnBuscar").addEventListener("click",()=>{t=1,r()}),await r());
