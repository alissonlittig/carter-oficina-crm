import type { Item, Order, Status } from "./types";

export const STATUS: Record<Status, { label: string; cor: string }> = {
  orcamento: { label: "Orçamento", cor: "#8b5cf6" },
  aprovado: { label: "Aprovado", cor: "#0ea5e9" },
  em_servico: { label: "Em serviço", cor: "#e8590c" },
  aguardando_peca: { label: "Aguardando peça", cor: "#d99a00" },
  pronto: { label: "Pronto", cor: "#16a34a" },
  entregue: { label: "Entregue", cor: "#6b7280" },
  recusado: { label: "Recusado", cor: "#dc2626" },
};
export const FLUXO: Status[] = ["orcamento", "aprovado", "em_servico", "aguardando_peca", "pronto", "entregue"];
export const ABERTAS: Status[] = ["aprovado", "em_servico", "aguardando_peca"];

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const uid = () => Math.random().toString(36).slice(2, 10);

export const normPlaca = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
export const placaValida = (s: string) => /^[A-Z]{3}\d[A-Z]\d{2}$/.test(s) || /^[A-Z]{3}\d{4}$/.test(s);
/** Placa antiga ganha hífen (ABC-1234); Mercosul fica colada. */
export const fmtPlaca = (s: string) => (/^[A-Z]{3}\d{4}$/.test(s) ? `${s.slice(0, 3)}-${s.slice(3)}` : s);

export const subtotal = (itens: Item[]) => itens.reduce((a, i) => a + i.qtd * i.preco, 0);
export const totalOS = (o: Pick<Order, "itens" | "desconto">) => Math.max(0, subtotal(o.itens) - o.desconto);
export const totalPor = (itens: Item[], tipo: Item["tipo"]) => subtotal(itens.filter((i) => i.tipo === tipo));

const MS = 86400000;
export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const diasAtras = (n: number) => iso(new Date(Date.now() - n * MS));
export const diasEntre = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / MS);
export const hoje = () => iso(new Date());
export const fmtData = (s: string) => (s ? s.split("-").reverse().join("/").slice(0, 5) + "/" + s.slice(2, 4) : "—");
export const mesChave = (s: string) => s.slice(0, 7);
export const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export const iniciais = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
export const proximo = (s: Status): Status | null => {
  const i = FLUXO.indexOf(s);
  return i >= 0 && i < FLUXO.length - 1 ? FLUXO[i + 1] : null;
};
export const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
