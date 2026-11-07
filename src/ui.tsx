import { For, Show, type JSX } from "solid-js";
import { STATUS } from "./util";
import type { Status } from "./types";

const P: Record<string, string> = {
  painel: "M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-12h8V3h-8z",
  os: "M9 3h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4a1 1 0 0 1 1-1zm0 7h6M9 14h6M9 18h3",
  carro: "M5 17h14M5 17a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0M3 13l2-6a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 6v4h-2M3 13v4h2M3 13h18",
  gente: "M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1m12-10a3 3 0 1 0 0-6m5 16v-1a4 4 0 0 0-3-3.9M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  cat: "M12 2l9 5v10l-9 5-9-5V7zm0 10l9-5M12 12v10M12 12L3 7",
  busca: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2l-4.3-4.3",
  mais: "M12 5v14M5 12h14",
  x: "M18 6L6 18M6 6l12 12",
  imp: "M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z",
  lixo: "M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3",
  seta: "M5 12h14m-6-6l6 6-6 6",
  zap: "M13 2L4 14h7l-1 8 9-12h-7z",
  lua: "M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z",
  sol: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  zap2: "M3 12l5 5L21 5",
  fone: "M22 17v3a2 2 0 0 1-2.2 2A19 19 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 17z",
};
export const Icon = (p: { n: string; s?: number }) => (
  <svg width={p.s ?? 18} height={p.s ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d={P[p.n]} />
  </svg>
);

export const Badge = (p: { s: Status }) => (
  <span class="badge" style={{ "--c": STATUS[p.s].cor }}>{STATUS[p.s].label}</span>
);

export const Plate = (p: { v: string }) => (
  <span class="plate" aria-label={`Placa ${p.v}`}><i /><b>{p.v}</b></span>
);

export const Drawer = (p: { titulo: string; sub?: string; onClose: () => void; children: JSX.Element; rodape?: JSX.Element }) => (
  <div class="scrim" onClick={(e) => e.target === e.currentTarget && p.onClose()}>
    <aside class="drawer" role="dialog" aria-modal="true" aria-label={p.titulo}>
      <header>
        <div><h2>{p.titulo}</h2><Show when={p.sub}><p>{p.sub}</p></Show></div>
        <button class="icon" onClick={p.onClose} aria-label="Fechar"><Icon n="x" /></button>
      </header>
      <div class="body">{p.children}</div>
      <Show when={p.rodape}><footer>{p.rodape}</footer></Show>
    </aside>
  </div>
);

export const Field = (p: { label: string; children: JSX.Element; wide?: boolean }) => (
  <label class="field" classList={{ wide: p.wide }}><span>{p.label}</span>{p.children}</label>
);

export const Empty = (p: { t: string }) => <div class="empty">{p.t}</div>;

export const PageHead = (p: { titulo: string; sub: string; acao?: JSX.Element }) => (
  <div class="pagehead"><div><h1>{p.titulo}</h1><p>{p.sub}</p></div>{p.acao}</div>
);

export const Kpi = (p: { l: string; v: string; d?: string; tone?: string }) => (
  <div class="kpi" data-tone={p.tone}><span>{p.l}</span><strong>{p.v}</strong><Show when={p.d}><em>{p.d}</em></Show></div>
);

export function Bars(p: { dados: { l: string; v: number }[]; fmt: (n: number) => string }) {
  const max = () => Math.max(1, ...p.dados.map((d) => d.v));
  return (
    <div class="bars" role="img" aria-label="Faturamento por mês">
      <For each={p.dados}>{(d, i) => (
        <div class="bar" classList={{ last: i() === p.dados.length - 1 }}>
          <em>{p.fmt(d.v)}</em>
          <div class="col"><div style={{ height: `${(d.v / max()) * 100}%` }} /></div>
          <span>{d.l}</span>
        </div>
      )}</For>
    </div>
  );
}
