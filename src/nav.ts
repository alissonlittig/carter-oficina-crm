import { createSignal } from "solid-js";
import type { Order } from "./types";

export type Rota = "painel" | "os" | "veiculos" | "clientes" | "catalogo";
export const ROTAS: Rota[] = ["painel", "os", "veiculos", "clientes", "catalogo"];
const lerHash = (): Rota => {
  const h = location.hash.replace("#/", "") as Rota;
  return ROTAS.includes(h) ? h : "painel";
};
export const [rota, setRotaSig] = createSignal<Rota>(lerHash());
window.addEventListener("hashchange", () => setRotaSig(lerHash()));
export const ir = (r: Rota) => { location.hash = `#/${r}`; };

/** OS em edição no painel lateral (cópia de trabalho; só grava ao salvar). */
export const [osAberta, abrirOS] = createSignal<Order | null>(null);
export const [veiculoAberto, abrirVeiculo] = createSignal<string | null>(null);
export const [clienteAberto, abrirCliente] = createSignal<string | null>(null);
/** Texto de busca por placa vindo da barra global. */
export const [buscaPlaca, setBuscaPlaca] = createSignal("");
