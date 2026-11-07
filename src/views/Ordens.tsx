import { For, Show, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Badge, Drawer, Empty, Field, Icon, PageHead, Plate } from "../ui";
import { cliente, db, mudarStatus, novaOS, remover, salvar, veiculo } from "../store";
import { abrirOS, osAberta } from "../nav";
import { clone, FLUXO, STATUS, brl, fmtData, fmtPlaca, hoje, proximo, subtotal, totalOS, totalPor, uid } from "../util";
import type { Order, Status } from "../types";

const COLS: Status[] = ["orcamento", "aprovado", "em_servico", "aguardando_peca", "pronto", "entregue"];

function Card(p: { o: Order }) {
  const v = () => veiculo(p.o.veiculoId);
  const prox = () => proximo(p.o.status);
  return (
    <article class="oscard" onClick={() => abrirOS(clone(p.o))} tabindex="0" onKeyDown={(e) => e.key === "Enter" && abrirOS(clone(p.o))}>
      <div class="top">
        <span class="num">#{p.o.num}</span>
        <Show when={p.o.status !== "entregue" && p.o.status !== "recusado" && p.o.previsao < hoje()}><span class="late">atrasada</span></Show>
        <Show when={p.o.status === "entregue"}><span class="dt">{fmtData(p.o.fechamento ?? "")}</span></Show>
      </div>
      <Show when={v()}><Plate v={fmtPlaca(v()!.placa)} /></Show>
      <b>{v()?.marca} {v()?.modelo}</b>
      <small>{cliente(v()?.clienteId ?? "")?.nome}</small>
      <p>{p.o.queixa || "Sem descrição"}</p>
      <div class="foot">
        <strong>{brl(totalOS(p.o))}</strong>
        <Show when={prox()}>
          <button class="btn ghost sm" onClick={(e) => { e.stopPropagation(); mudarStatus(p.o.id, prox()!); }} title={`Mover para ${STATUS[prox()!].label}`}>
            {STATUS[prox()!].label}<Icon n="seta" s={13} />
          </button>
        </Show>
      </div>
    </article>
  );
}

export default function Ordens() {
  const [vista, setVista] = createSignal<"quadro" | "lista">(window.innerWidth < 760 ? "lista" : "quadro");
  const [q, setQ] = createSignal("");
  const [filtro, setFiltro] = createSignal<Status | "todas">("todas");
  const lista = createMemo(() => {
    const limpa = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "");
    const t = limpa(q());
    return db.ordens
      .filter((o) => {
        const v = veiculo(o.veiculoId);
        const alvo = limpa(`${o.num} ${v?.placa} ${v?.modelo} ${v?.marca} ${cliente(v?.clienteId ?? "")?.nome} ${o.queixa}`);
        return (!t || alvo.includes(t)) && (filtro() === "todas" || o.status === filtro());
      })
      .sort((a, b) => b.num - a.num);
  });

  return (
    <>
      <PageHead titulo="Ordens de serviço" sub="Do orçamento à entrega, num quadro só." acao={<button class="btn" onClick={() => abrirOS(novaOS())}><Icon n="mais" s={16} />Nova OS</button>} />
      <div class="toolbar">
        <div class="search"><Icon n="busca" s={16} /><input value={q()} onInput={(e) => setQ(e.currentTarget.value)} placeholder="Placa, cliente, modelo ou nº da OS" aria-label="Buscar OS" /></div>
        <div class="seg" role="group" aria-label="Vista">
          <button classList={{ on: vista() === "quadro" }} onClick={() => setVista("quadro")}>Quadro</button>
          <button classList={{ on: vista() === "lista" }} onClick={() => setVista("lista")}>Lista</button>
        </div>
      </div>

      <Show
        when={vista() === "quadro"}
        fallback={
          <>
            <div class="chips">
              <button classList={{ on: filtro() === "todas" }} onClick={() => setFiltro("todas")}>Todas</button>
              <For each={[...COLS, "recusado" as Status]}>{(s) => <button classList={{ on: filtro() === s }} onClick={() => setFiltro(s)}>{STATUS[s].label}</button>}</For>
            </div>
            <Show when={lista().length} fallback={<Empty t="Nenhuma OS encontrada." />}>
              <div class="card flush">
                <ul class="rows">
                  <For each={lista()}>{(o) => {
                    const v = () => veiculo(o.veiculoId);
                    return (
                      <li>
                        <button class="row" onClick={() => abrirOS(clone(o))}>
                          <Plate v={fmtPlaca(v()?.placa ?? "")} />
                          <span class="grow"><b>#{o.num} · {v()?.modelo}</b><small>{cliente(v()?.clienteId ?? "")?.nome} · {o.queixa}</small></span>
                          <span class="r"><Badge s={o.status} /><small>{brl(totalOS(o))}</small></span>
                        </button>
                      </li>
                    );
                  }}</For>
                </ul>
              </div>
            </Show>
          </>
        }
      >
        <div class="board">
          <For each={COLS}>{(s) => {
            const itens = () => lista().filter((o) => o.status === s);
            return (
              <section class="col" style={{ "--c": STATUS[s].cor }}>
                <h4><i />{STATUS[s].label}<b>{itens().length}</b></h4>
                <div class="stackcards">
                  <For each={itens()} fallback={<div class="vazio">vazio</div>}>{(o) => <Card o={o} />}</For>
                </div>
              </section>
            );
          }}</For>
        </div>
      </Show>
      <Show when={osAberta()}><OsEditor /></Show>
    </>
  );
}

function OsEditor() {
  const [o, setO] = createStore<Order>(clone(osAberta()!));
  const existe = () => db.ordens.some((x) => x.id === o.id);
  const v = () => veiculo(o.veiculoId);
  const [busca, setBusca] = createSignal("");
  const sugestoes = () => {
    const t = busca().toLowerCase();
    return t.length < 2 ? [] : db.catalogo.filter((c) => c.desc.toLowerCase().includes(t)).slice(0, 5);
  };
  const add = (tipo: "servico" | "peca", desc: string, preco: number) => setO("itens", (l) => [...l, { id: uid(), tipo, desc, preco, qtd: 1 }]);
  const fechar = () => abrirOS(null);
  const gravar = () => {
    if (!o.veiculoId) return;
    salvar("ordens", { ...o, fechamento: o.status === "entregue" ? o.fechamento ?? hoje() : undefined });
    fechar();
  };

  return (
    <Drawer
      titulo={`${existe() ? "OS" : "Nova OS"} #${o.num}`}
      sub={v() ? `${v()!.marca} ${v()!.modelo} · ${fmtPlaca(v()!.placa)}` : "Escolha o veículo"}
      onClose={fechar}
      rodape={
        <>
          <Show when={existe()}>
            <button class="btn ghost danger" onClick={() => { if (confirm("Excluir esta OS?")) { remover("ordens", o.id); fechar(); } }} aria-label="Excluir OS"><Icon n="lixo" s={16} /></button>
          </Show>
          <button class="btn ghost" onClick={() => window.print()}><Icon n="imp" s={16} />Imprimir</button>
          <span class="grow" />
          <button class="btn" disabled={!o.veiculoId} onClick={gravar}>Salvar</button>
        </>
      }
    >
      <div class="stepper" role="group" aria-label="Etapa">
        <For each={FLUXO}>{(s) => (
          <button classList={{ on: o.status === s, done: FLUXO.indexOf(s) < FLUXO.indexOf(o.status) }} style={{ "--c": STATUS[s].cor }} onClick={() => setO("status", s)}>{STATUS[s].label}</button>
        )}</For>
        <button classList={{ on: o.status === "recusado" }} style={{ "--c": STATUS.recusado.cor }} onClick={() => setO("status", "recusado")}>Recusado</button>
      </div>

      <div class="form">
        <Field label="Veículo" wide>
          <select onChange={(e) => { setO("veiculoId", e.currentTarget.value); setO("km", veiculo(e.currentTarget.value)?.km ?? 0); }}>
            <option value="">Selecione…</option>
            <For each={db.veiculos}>{(x) => <option value={x.id} selected={x.id === o.veiculoId}>{fmtPlaca(x.placa)} · {x.marca} {x.modelo} — {cliente(x.clienteId)?.nome}</option>}</For>
          </select>
        </Field>
        <Field label="Queixa do cliente" wide><textarea rows="2" value={o.queixa} onInput={(e) => setO("queixa", e.currentTarget.value)} /></Field>
        <Field label="Abertura"><input type="date" value={o.abertura} onInput={(e) => setO("abertura", e.currentTarget.value)} /></Field>
        <Field label="Previsão de entrega"><input type="date" value={o.previsao} onInput={(e) => setO("previsao", e.currentTarget.value)} /></Field>
        <Field label="Km na entrada"><input type="number" min="0" value={o.km} onInput={(e) => setO("km", +e.currentTarget.value)} /></Field>
        <Field label="Desconto (R$)"><input type="number" min="0" step="0.01" value={o.desconto} onInput={(e) => setO("desconto", Math.max(0, +e.currentTarget.value))} /></Field>
      </div>

      <h3 class="sec">Serviços e peças</h3>
      <div class="itens">
        <For each={o.itens} fallback={<Empty t="Nenhum item ainda. Busque no catálogo abaixo." />}>{(i, idx) => (
          <div class="item">
            <span class="tipo" data-t={i.tipo}>{i.tipo === "servico" ? "Serviço" : "Peça"}</span>
            <input class="desc" value={i.desc} onInput={(e) => setO("itens", idx(), "desc", e.currentTarget.value)} aria-label="Descrição" />
            <input class="qtd" type="number" min="1" value={i.qtd} onInput={(e) => setO("itens", idx(), "qtd", Math.max(1, +e.currentTarget.value))} aria-label="Quantidade" />
            <input class="preco" type="number" min="0" step="0.01" value={i.preco} onInput={(e) => setO("itens", idx(), "preco", Math.max(0, +e.currentTarget.value))} aria-label="Preço unitário" />
            <b class="sub">{brl(i.qtd * i.preco)}</b>
            <button class="icon" onClick={() => setO("itens", (l) => l.filter((x) => x.id !== i.id))} aria-label="Remover item"><Icon n="x" s={15} /></button>
          </div>
        )}</For>
      </div>
      <div class="adder">
        <div class="search"><Icon n="busca" s={16} /><input value={busca()} onInput={(e) => setBusca(e.currentTarget.value)} placeholder="Buscar no catálogo (óleo, freio, correia…)" aria-label="Buscar no catálogo" /></div>
        <Show when={sugestoes().length}>
          <ul class="sug"><For each={sugestoes()}>{(c) => (
            <li><button onClick={() => { add(c.tipo, c.desc, c.preco); setBusca(""); }}><span class="tipo" data-t={c.tipo}>{c.tipo === "servico" ? "Serviço" : "Peça"}</span>{c.desc}<b>{brl(c.preco)}</b></button></li>
          )}</For></ul>
        </Show>
        <div class="avulso">
          <button class="btn ghost sm" onClick={() => add("servico", "Novo serviço", 0)}>+ serviço avulso</button>
          <button class="btn ghost sm" onClick={() => add("peca", "Nova peça", 0)}>+ peça avulsa</button>
        </div>
      </div>

      <dl class="totais">
        <div><dt>Mão de obra</dt><dd>{brl(totalPor(o.itens, "servico"))}</dd></div>
        <div><dt>Peças</dt><dd>{brl(totalPor(o.itens, "peca"))}</dd></div>
        <Show when={o.desconto > 0}><div><dt>Desconto</dt><dd>− {brl(Math.min(o.desconto, subtotal(o.itens)))}</dd></div></Show>
        <div class="t"><dt>Total</dt><dd>{brl(totalOS(o))}</dd></div>
      </dl>
      <Field label="Observações internas" wide><textarea rows="2" value={o.obs} onInput={(e) => setO("obs", e.currentTarget.value)} /></Field>
    </Drawer>
  );
}
