import { For, Match, Switch, createSignal } from "solid-js";
import { Icon } from "./ui";
import { ROTAS, ir, rota, setBuscaPlaca, type Rota } from "./nav";
import { resetar } from "./store";
import Painel from "./views/Painel";
import Ordens from "./views/Ordens";
import Veiculos from "./views/Veiculos";
import Clientes from "./views/Clientes";
import Catalogo from "./views/Catalogo";

const NAV: Record<Rota, { l: string; i: string }> = {
  painel: { l: "Painel", i: "painel" }, os: { l: "Ordens", i: "os" }, veiculos: { l: "Veículos", i: "carro" },
  clientes: { l: "Clientes", i: "gente" }, catalogo: { l: "Catálogo", i: "cat" },
};

export default function App() {
  const [escuro, setEscuro] = createSignal(localStorage.getItem("carter.tema") === "escuro" || (!localStorage.getItem("carter.tema") && matchMedia("(prefers-color-scheme: dark)").matches));
  const aplicar = () => { document.documentElement.dataset.tema = escuro() ? "escuro" : "claro"; };
  aplicar();
  const alternar = () => { setEscuro(!escuro()); localStorage.setItem("carter.tema", escuro() ? "escuro" : "claro"); aplicar(); };

  return (
    <div class="app">
      <aside class="side">
        <a class="brand" href="#/painel"><span class="logo"><Icon n="zap" s={16} /></span><b>Cárter</b></a>
        <nav aria-label="Principal">
          <For each={ROTAS}>{(r) => <a href={`#/${r}`} classList={{ on: rota() === r }} aria-current={rota() === r ? "page" : undefined}><Icon n={NAV[r].i} /><span>{NAV[r].l}</span></a>}</For>
        </nav>
        <div class="demo">
          <p><b>Demo</b> Dados fictícios, salvos só neste navegador.</p>
          <button class="link" onClick={() => confirm("Restaurar os dados de demonstração?") && resetar()}>Restaurar demo</button>
        </div>
      </aside>
      <div class="main">
        <header class="top">
          <form class="gsearch" onSubmit={(e) => { e.preventDefault(); ir("veiculos"); }}>
            <Icon n="busca" s={16} />
            <input placeholder="Buscar placa…" aria-label="Busca global por placa" onInput={(e) => { setBuscaPlaca(e.currentTarget.value); if (rota() !== "veiculos") ir("veiculos"); }} />
          </form>
          <button class="icon" onClick={alternar} aria-label={escuro() ? "Tema claro" : "Tema escuro"}><Icon n={escuro() ? "sol" : "lua"} /></button>
        </header>
        <main id="conteudo">
          <Switch>
            <Match when={rota() === "painel"}><Painel /></Match>
            <Match when={rota() === "os"}><Ordens /></Match>
            <Match when={rota() === "veiculos"}><Veiculos /></Match>
            <Match when={rota() === "clientes"}><Clientes /></Match>
            <Match when={rota() === "catalogo"}><Catalogo /></Match>
          </Switch>
        </main>
      </div>
    </div>
  );
}
