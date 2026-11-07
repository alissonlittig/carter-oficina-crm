import { For, Show, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Badge, Drawer, Empty, Field, Icon, PageHead, Plate } from "../ui";
import { cliente, db, novaOS, ordensDe, salvar, veiculo } from "../store";
import { abrirCliente, abrirOS, abrirVeiculo, buscaPlaca, setBuscaPlaca, veiculoAberto } from "../nav";
import { clone, brl, fmtData, fmtPlaca, normPlaca, placaValida, totalOS, uid } from "../util";
import type { Vehicle } from "../types";

export default function Veiculos() {
  const [novo, setNovo] = createSignal(false);
  const lista = createMemo(() => {
    const t = normPlaca(buscaPlaca());
    const txt = buscaPlaca().toLowerCase();
    return db.veiculos.filter((v) => !txt || v.placa.includes(t) || `${v.marca} ${v.modelo} ${cliente(v.clienteId)?.nome}`.toLowerCase().includes(txt));
  });
  const gasto = (id: string) => ordensDe(id).filter((o) => o.status === "entregue").reduce((a, o) => a + totalOS(o), 0);

  return (
    <>
      <PageHead titulo="Veículos" sub="Digite a placa e veja tudo que já foi feito no carro." acao={<button class="btn" onClick={() => setNovo(true)}><Icon n="mais" s={16} />Novo veículo</button>} />
      <div class="plate-search">
        <div class="plate big"><i /><input value={buscaPlaca()} onInput={(e) => setBuscaPlaca(e.currentTarget.value)} placeholder="ABC1D23" maxLength={20} aria-label="Buscar por placa, modelo ou dono" /></div>
        <small>{lista().length} de {db.veiculos.length} veículos</small>
      </div>
      <Show when={lista().length} fallback={<Empty t="Nenhum veículo com essa placa. Cadastre em “Novo veículo”." />}>
        <div class="cards">
          <For each={lista()}>{(v) => {
            const hist = () => ordensDe(v.id);
            return (
              <button class="vcard" onClick={() => abrirVeiculo(v.id)}>
                <Plate v={fmtPlaca(v.placa)} />
                <b>{v.marca} {v.modelo}</b>
                <small>{v.ano} · {v.cor} · {v.km.toLocaleString("pt-BR")} km</small>
                <span class="meta"><span>{cliente(v.clienteId)?.nome}</span><span>{hist().length} OS · {brl(gasto(v.id))}</span></span>
              </button>
            );
          }}</For>
        </div>
      </Show>
      <Show when={veiculoAberto()}><Historico id={veiculoAberto()!} /></Show>
      <Show when={novo()}><Form onClose={() => setNovo(false)} /></Show>
    </>
  );
}

function Historico(p: { id: string }) {
  const v = () => veiculo(p.id)!;
  const hist = () => ordensDe(p.id);
  const [edita, setEdita] = createSignal(false);
  return (
    <Drawer titulo={`${v().marca} ${v().modelo}`} sub={`${v().ano} · ${v().cor} · ${v().km.toLocaleString("pt-BR")} km`} onClose={() => abrirVeiculo(null)}
      rodape={<><button class="btn ghost" onClick={() => setEdita(true)}>Editar</button><span class="grow" /><button class="btn" onClick={() => { abrirVeiculo(null); abrirOS(novaOS(p.id)); }}><Icon n="mais" s={16} />Nova OS</button></>}>
      <div class="vhead">
        <Plate v={fmtPlaca(v().placa)} />
        <button class="link" onClick={() => { abrirVeiculo(null); abrirCliente(v().clienteId); }}>{cliente(v().clienteId)?.nome} <Icon n="seta" s={14} /></button>
      </div>
      <h3 class="sec">Histórico por placa</h3>
      <Show when={hist().length} fallback={<Empty t="Sem serviços registrados neste veículo." />}>
        <ol class="timeline">
          <For each={hist()}>{(o) => (
            <li>
              <button onClick={() => { abrirVeiculo(null); abrirOS(clone(o)); }}>
                <div class="t1"><b>#{o.num} · {fmtData(o.abertura)}</b><Badge s={o.status} /></div>
                <p>{o.queixa}</p>
                <small>{o.km.toLocaleString("pt-BR")} km · {o.itens.map((i) => i.desc).slice(0, 3).join(", ")}{o.itens.length > 3 ? "…" : ""}</small>
                <strong>{brl(totalOS(o))}</strong>
              </button>
            </li>
          )}</For>
        </ol>
      </Show>
      <Show when={edita()}><Form v={v()} onClose={() => setEdita(false)} /></Show>
    </Drawer>
  );
}

function Form(p: { v?: Vehicle; onClose: () => void }) {
  const [f, setF] = createStore<Vehicle>(p.v ? { ...p.v } : { id: uid(), placa: "", marca: "", modelo: "", ano: new Date().getFullYear(), cor: "", km: 0, clienteId: db.clientes[0]?.id ?? "" });
  const duplicada = () => db.veiculos.some((x) => x.placa === f.placa && x.id !== f.id);
  const ok = () => placaValida(f.placa) && !duplicada() && f.marca.trim() && f.modelo.trim() && f.clienteId;
  return (
    <Drawer titulo={p.v ? "Editar veículo" : "Novo veículo"} onClose={p.onClose} rodape={<><span class="grow" /><button class="btn" disabled={!ok()} onClick={() => { salvar("veiculos", f); p.onClose(); }}>Salvar</button></>}>
      <div class="form">
        <Field label="Placa" wide>
          <input value={f.placa} onInput={(e) => setF("placa", normPlaca(e.currentTarget.value))} placeholder="ABC1D23" />
          <Show when={f.placa && !placaValida(f.placa)}><em class="err">Formato inválido (ABC1D23 ou ABC1234).</em></Show>
          <Show when={duplicada()}><em class="err">Já existe um veículo com esta placa.</em></Show>
        </Field>
        <Field label="Marca"><input value={f.marca} onInput={(e) => setF("marca", e.currentTarget.value)} /></Field>
        <Field label="Modelo"><input value={f.modelo} onInput={(e) => setF("modelo", e.currentTarget.value)} /></Field>
        <Field label="Ano"><input type="number" value={f.ano} onInput={(e) => setF("ano", +e.currentTarget.value)} /></Field>
        <Field label="Cor"><input value={f.cor} onInput={(e) => setF("cor", e.currentTarget.value)} /></Field>
        <Field label="Km atual"><input type="number" min="0" value={f.km} onInput={(e) => setF("km", +e.currentTarget.value)} /></Field>
        <Field label="Proprietário" wide>
          <select onChange={(e) => setF("clienteId", e.currentTarget.value)}>
            <For each={db.clientes}>{(c) => <option value={c.id} selected={c.id === f.clienteId}>{c.nome}</option>}</For>
          </select>
        </Field>
      </div>
    </Drawer>
  );
}
