import { For, Show, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Badge, Drawer, Empty, Field, Icon, PageHead, Plate } from "../ui";
import { cliente, db, ordensDe, salvar } from "../store";
import { abrirCliente, abrirOS, abrirVeiculo, clienteAberto } from "../nav";
import { clone, brl, fmtData, fmtPlaca, hoje, iniciais, totalOS, uid } from "../util";
import type { Customer } from "../types";

const doCliente = (id: string) => db.veiculos.filter((v) => v.clienteId === id);
const gasto = (id: string) => doCliente(id).flatMap((v) => ordensDe(v.id)).filter((o) => o.status === "entregue").reduce((a, o) => a + totalOS(o), 0);

export default function Clientes() {
  const [q, setQ] = createSignal("");
  const [novo, setNovo] = createSignal(false);
  const lista = createMemo(() => {
    const t = q().toLowerCase();
    return db.clientes.filter((c) => !t || `${c.nome} ${c.cidade} ${c.tel}`.toLowerCase().includes(t));
  });
  return (
    <>
      <PageHead titulo="Clientes" sub="Quem traz o carro, quanto já gastou e quantos veículos tem." acao={<button class="btn" onClick={() => setNovo(true)}><Icon n="mais" s={16} />Novo cliente</button>} />
      <div class="toolbar"><div class="search"><Icon n="busca" s={16} /><input value={q()} onInput={(e) => setQ(e.currentTarget.value)} placeholder="Nome, cidade ou telefone" aria-label="Buscar cliente" /></div></div>
      <Show when={lista().length} fallback={<Empty t="Nenhum cliente encontrado." />}>
        <div class="card flush">
          <ul class="rows">
            <For each={lista()}>{(c) => (
              <li>
                <button class="row" onClick={() => abrirCliente(c.id)}>
                  <span class="avatar">{iniciais(c.nome)}</span>
                  <span class="grow"><b>{c.nome}</b><small>{c.cidade} · {c.tel}</small></span>
                  <span class="r"><b>{brl(gasto(c.id))}</b><small>{doCliente(c.id).length} veículo(s)</small></span>
                </button>
              </li>
            )}</For>
          </ul>
        </div>
      </Show>
      <Show when={clienteAberto()}><Detalhe id={clienteAberto()!} /></Show>
      <Show when={novo()}><Form onClose={() => setNovo(false)} /></Show>
    </>
  );
}

function Detalhe(p: { id: string }) {
  const c = () => cliente(p.id)!;
  const [edita, setEdita] = createSignal(false);
  const ordens = () => doCliente(p.id).flatMap((v) => ordensDe(v.id)).sort((a, b) => b.abertura.localeCompare(a.abertura));
  return (
    <Drawer titulo={c().nome} sub={`${c().cidade} · cliente desde ${fmtData(c().desde)}`} onClose={() => abrirCliente(null)}
      rodape={<><button class="btn ghost" onClick={() => setEdita(true)}>Editar</button><span class="grow" /><a class="btn ghost" href={`https://wa.me/55${c().tel.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"><Icon n="fone" s={16} />WhatsApp</a></>}>
      <dl class="totais flat">
        <div><dt>Telefone</dt><dd>{c().tel}</dd></div>
        <div><dt>E-mail</dt><dd>{c().email}</dd></div>
        <div class="t"><dt>Total gasto</dt><dd>{brl(gasto(p.id))}</dd></div>
      </dl>
      <h3 class="sec">Veículos</h3>
      <Show when={doCliente(p.id).length} fallback={<Empty t="Nenhum veículo vinculado." />}>
        <ul class="rows">
          <For each={doCliente(p.id)}>{(v) => (
            <li><button class="row" onClick={() => { abrirCliente(null); abrirVeiculo(v.id); }}><Plate v={fmtPlaca(v.placa)} /><span class="grow"><b>{v.marca} {v.modelo}</b><small>{v.ano} · {v.cor}</small></span><Icon n="seta" s={14} /></button></li>
          )}</For>
        </ul>
      </Show>
      <h3 class="sec">Ordens de serviço</h3>
      <Show when={ordens().length} fallback={<Empty t="Sem OS ainda." />}>
        <ul class="rows">
          <For each={ordens()}>{(o) => (
            <li><button class="row" onClick={() => { abrirCliente(null); abrirOS(clone(o)); }}><span class="grow"><b>#{o.num} · {fmtData(o.abertura)}</b><small>{o.queixa}</small></span><span class="r"><Badge s={o.status} /><small>{brl(totalOS(o))}</small></span></button></li>
          )}</For>
        </ul>
      </Show>
      <Show when={edita()}><Form c={c()} onClose={() => setEdita(false)} /></Show>
    </Drawer>
  );
}

function Form(p: { c?: Customer; onClose: () => void }) {
  const [f, setF] = createStore<Customer>(p.c ? { ...p.c } : { id: uid(), nome: "", tel: "", email: "", cidade: "Curitiba", desde: hoje() });
  return (
    <Drawer titulo={p.c ? "Editar cliente" : "Novo cliente"} onClose={p.onClose} rodape={<><span class="grow" /><button class="btn" disabled={!f.nome.trim()} onClick={() => { salvar("clientes", f); p.onClose(); }}>Salvar</button></>}>
      <div class="form">
        <Field label="Nome" wide><input value={f.nome} onInput={(e) => setF("nome", e.currentTarget.value)} /></Field>
        <Field label="Telefone"><input value={f.tel} onInput={(e) => setF("tel", e.currentTarget.value)} placeholder="(41) 90000-0000" inputmode="tel" /></Field>
        <Field label="Cidade"><input value={f.cidade} onInput={(e) => setF("cidade", e.currentTarget.value)} /></Field>
        <Field label="E-mail" wide><input type="email" value={f.email} onInput={(e) => setF("email", e.currentTarget.value)} /></Field>
      </div>
    </Drawer>
  );
}
