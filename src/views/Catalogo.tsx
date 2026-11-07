import { For, Show, createSignal } from "solid-js";
import { Empty, Icon, PageHead } from "../ui";
import { db, remover, salvar, setDb } from "../store";
import { brl, uid } from "../util";

export default function Catalogo() {
  const [tipo, setTipo] = createSignal<"servico" | "peca">("servico");
  const [desc, setDesc] = createSignal("");
  const [preco, setPreco] = createSignal("");
  const lista = () => db.catalogo.filter((c) => c.tipo === tipo());
  const valido = () => desc().trim() && Number(preco()) > 0;
  const add = (e: Event) => {
    e.preventDefault();
    if (!valido()) return;
    salvar("catalogo", { id: uid(), tipo: tipo(), desc: desc().trim(), preco: Number(preco()) });
    setDesc(""); setPreco("");
  };
  return (
    <>
      <PageHead titulo="Catálogo" sub="Serviços e peças com preço de tabela. Entram na OS com um clique." />
      <div class="toolbar">
        <div class="seg" role="group" aria-label="Tipo">
          <button classList={{ on: tipo() === "servico" }} onClick={() => setTipo("servico")}>Serviços</button>
          <button classList={{ on: tipo() === "peca" }} onClick={() => setTipo("peca")}>Peças</button>
        </div>
      </div>
      <form class="card addrow" onSubmit={add}>
        <input value={desc()} onInput={(e) => setDesc(e.currentTarget.value)} placeholder={tipo() === "servico" ? "Novo serviço" : "Nova peça"} aria-label="Descrição" />
        <input value={preco()} onInput={(e) => setPreco(e.currentTarget.value)} type="number" min="0" step="0.01" placeholder="Preço" aria-label="Preço" />
        <button class="btn" disabled={!valido()}><Icon n="mais" s={16} />Adicionar</button>
      </form>
      <Show when={lista().length} fallback={<Empty t="Nada cadastrado." />}>
        <div class="card flush">
          <ul class="rows">
            <For each={lista()}>{(c) => (
              <li class="row static">
                <span class="grow"><b>{c.desc}</b></span>
                <label class="price"><span>R$</span><input type="number" min="0" step="0.01" value={c.preco} onChange={(e) => setDb("catalogo", (x) => x.id === c.id, "preco", Math.max(0, +e.currentTarget.value))} aria-label={`Preço de ${c.desc}`} /></label>
                <b class="fmt">{brl(c.preco)}</b>
                <button class="icon" onClick={() => remover("catalogo", c.id)} aria-label={`Remover ${c.desc}`}><Icon n="lixo" s={15} /></button>
              </li>
            )}</For>
          </ul>
        </div>
      </Show>
    </>
  );
}
