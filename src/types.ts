export type Status = "orcamento" | "aprovado" | "em_servico" | "aguardando_peca" | "pronto" | "entregue" | "recusado";

export interface Customer { id: string; nome: string; tel: string; email: string; cidade: string; desde: string }
export interface Vehicle { id: string; placa: string; marca: string; modelo: string; ano: number; cor: string; km: number; clienteId: string }
export interface Item { id: string; tipo: "servico" | "peca"; desc: string; qtd: number; preco: number }
export interface Order {
  id: string; num: number; veiculoId: string; status: Status; abertura: string; previsao: string;
  fechamento?: string; km: number; queixa: string; itens: Item[]; desconto: number; obs: string;
}
export interface CatalogItem { id: string; tipo: "servico" | "peca"; desc: string; preco: number }
export interface Data { clientes: Customer[]; veiculos: Vehicle[]; ordens: Order[]; catalogo: CatalogItem[] }
