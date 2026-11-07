import { For, Show } from "solid-js";
import { Bars, Badge, Empty, Icon, Kpi, PageHead, Plate } from "../ui";
import { cliente, db, veiculo } from "../store";
import { abrirOS, abrirVeiculo, ir } from "../nav";
import { clone, ABERTAS, MESES, STATUS, brl, diasAtras, diasEntre, fmtData, fmtPlaca, hoje, mesChave, totalOS } from "../util";
import type { Status } from "../types";

export default function Painel() {
  const ordens = () => db.ordens;
  const mes = mesChave(hoje());
  const emCurso = () => ordens().filter((o) => ABERTAS.includes(o.status));
  const orcs = () => ordens().filter((o) => o.status === "orcamento");
  const faturadoMes = () => ordens().filter((o) => o.status === "entregue" && mesChave(o.fechamento ?? "") === mes).reduce((a, o) => a + totalOS(o), 0);
  const entregues = () => ordens().filter((o) => o.status === "entregue");
  const ticket = () => (entregues().length ? entregues().reduce((a, o) => a + totalOS(o), 0) / entregues().length : 0);
  const taxa = () => {
    const dec = ordens().filter((o) => !["orcamento"].includes(o.status));
    const rec = ordens().filter((o) => o.status === "recusado").length;
    return dec.length ? Math.round(((dec.length - rec) / dec.length) * 100) : 0;
  };

  const serie = () => {
    const base = new Date();
    return Array.from({ length: 6 }, (_, k) => {
      const d = new Date(base.getFullYear(), base.getMonth() - (5 - k), 1);
      const ch = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { l: MESES[d.getMonth()], v: entregues().filter((o) => mesChave(o.fechamento ?? "") === ch).reduce((a, o) => a + totalOS(o), 0) };
    });
  };
  const porStatus = () => (Object.keys(STATUS) as Status[]).map((s) => ({ s, n: ordens().filter((o) => o.status === s).length })).filter((x) => x.n);
  const totalN = () => ordens().length;

  const atrasadas = () => emCurso().filter((o) => o.previsao < hoje());
  /** Veículos cuja última visita passou de 90 dias: lembrete de revisão. */
  const revisoes = () =>
    db.veiculos
      .map((v) => ({ v, ult: db.ordens.filter((o) => o.veiculoId === v.id && o.status === "entregue").map((o) => o.fechamento ?? o.abertura).sort().pop() }))
      .filter((x) => x.ult && x.ult < diasAtras(90) && !db.ordens.some((o) => o.veiculoId === x.v.id && ["orcamento", ...ABERTAS].includes(o.status)))
      .sort((a, b) => a.ult!.localeCompare(b.ult!)).slice(0, 5);

  const zap = (vid: string) => {
    const v = veiculo(vid)!;
    const c = cliente(v.clienteId)!;
    const t = `Olá ${c.nome.split(" ")[0]}! Já faz um tempo desde a última revisão do ${v.modelo} (${fmtPlaca(v.placa)}). Vamos agendar?`;
    return `https://wa.me/55${c.tel.replace(/\D/g, "")}?text=${encodeURIComponent(t)}`;
  };

  return (
    <>
      <PageHead titulo="Painel" sub="Visão do pátio e do caixa, atualizada a cada movimento." />
      <section class="kpis">
        <Kpi l="No pátio agora" v={String(emCurso().length)} d={`${atrasadas().length} com entrega atrasada`} tone={atrasadas().length ? "warn" : ""} />
        <Kpi l="Orçamentos abertos" v={String(orcs().length)} d={brl(orcs().reduce((a, o) => a + totalOS(o), 0)) + " em jogo"} />
        <Kpi l="Faturado no mês" v={brl(faturadoMes())} d="OS entregues" tone="ok" />
        <Kpi l="Ticket médio" v={brl(ticket())} d={`${taxa()}% dos orçamentos aprovados`} />
      </section>

      <section class="grid2">
        <div class="card">
          <h3>Faturamento · 6 meses</h3>
          <Bars dados={serie()} fmt={(n) => (n ? `${(n / 1000).toFixed(1).replace(".", ",")}k` : "—")} />
        </div>
        <div class="card">
          <h3>OS por etapa</h3>
          <div class="stack" role="img" aria-label="Distribuição das OS por etapa">
            <For each={porStatus()}>{(x) => <i style={{ flex: x.n, background: STATUS[x.s].cor }} title={`${STATUS[x.s].label}: ${x.n}`} />}</For>
          </div>
          <ul class="legend">
            <For each={porStatus()}>{(x) => <li><i style={{ background: STATUS[x.s].cor }} />{STATUS[x.s].label}<b>{x.n}</b><small>{Math.round((x.n / totalN()) * 100)}%</small></li>}</For>
          </ul>
        </div>
      </section>

      <section class="grid2">
        <div class="card">
          <div class="cardhead"><h3>Entregas previstas</h3><button class="link" onClick={() => ir("os")}>Ver quadro <Icon n="seta" s={14} /></button></div>
          <Show when={emCurso().length} fallback={<Empty t="Nenhuma OS em andamento." />}>
            <ul class="rows">
              <For each={[...emCurso()].sort((a, b) => a.previsao.localeCompare(b.previsao)).slice(0, 6)}>{(o) => {
                const v = () => veiculo(o.veiculoId)!;
                const atraso = () => diasEntre(o.previsao, hoje());
                return (
                  <li><button class="row" onClick={() => abrirOS(clone(o))}>
                    <Plate v={fmtPlaca(v().placa)} />
                    <span class="grow"><b>{v().marca} {v().modelo}</b><small>{cliente(v().clienteId)?.nome} · #{o.num}</small></span>
                    <span class="r"><Badge s={o.status} /><small classList={{ late: atraso() > 0 }}>{atraso() > 0 ? `${atraso()} d de atraso` : `prev. ${fmtData(o.previsao)}`}</small></span>
                  </button></li>
                );
              }}</For>
            </ul>
          </Show>
        </div>
        <div class="card">
          <h3>Hora de chamar de volta</h3>
          <p class="hint">Sem visita há mais de 90 dias e nada em aberto.</p>
          <Show when={revisoes().length} fallback={<Empty t="Todos os clientes estão em dia." />}>
            <ul class="rows">
              <For each={revisoes()}>{(x) => (
                <li class="row static">
                  <button class="plain" onClick={() => abrirVeiculo(x.v.id)}><Plate v={fmtPlaca(x.v.placa)} /></button>
                  <span class="grow"><b>{cliente(x.v.clienteId)?.nome}</b><small>{x.v.modelo} · última visita {fmtData(x.ult!)}</small></span>
                  <a class="btn ghost sm" href={zap(x.v.id)} target="_blank" rel="noopener noreferrer"><Icon n="fone" s={14} />WhatsApp</a>
                </li>
              )}</For>
            </ul>
          </Show>
        </div>
      </section>
    </>
  );
}
