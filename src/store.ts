import { createEffect, createRoot } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { seed } from "./seed";
import type { Data, Order, Status } from "./types";
import { clone, hoje, uid } from "./util";

const KEY = "carter.v1";
const load = (): Data => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Data;
  } catch { /* storage indisponível ou JSON corrompido: volta ao demo */ }
  return seed();
};

export const [db, setDb] = createStore<Data>(load());
createRoot(() => createEffect(() => {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* modo privado: segue só em memória */ }
}));

type K = keyof Data;
export const salvar = <T extends { id: string }>(k: K, v: T) =>
  setDb(produce((d) => {
    const lista = d[k] as unknown as T[];
    const i = lista.findIndex((x) => x.id === v.id);
    if (i >= 0) lista[i] = clone(v); else lista.push(clone(v));
  }));
export const remover = (k: K, id: string) => setDb(k, (l) => (l as { id: string }[]).filter((x) => x.id !== id) as never);
export const resetar = () => setDb(seed());

export const novaOS = (veiculoId = ""): Order => ({
  id: uid(), num: Math.max(1000, ...db.ordens.map((o) => o.num)) + 1, veiculoId, status: "orcamento",
  abertura: hoje(), previsao: hoje(), km: db.veiculos.find((v) => v.id === veiculoId)?.km ?? 0, queixa: "", itens: [], desconto: 0, obs: "",
});
export const mudarStatus = (id: string, s: Status) =>
  setDb("ordens", (o) => o.id === id, produce((o) => {
    o.status = s;
    o.fechamento = s === "entregue" ? hoje() : undefined;
  }));

export const veiculo = (id: string) => db.veiculos.find((v) => v.id === id);
export const cliente = (id: string) => db.clientes.find((c) => c.id === id);
export const ordensDe = (vid: string) => db.ordens.filter((o) => o.veiculoId === vid).sort((a, b) => b.abertura.localeCompare(a.abertura));
