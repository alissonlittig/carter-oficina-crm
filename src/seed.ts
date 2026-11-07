import type { CatalogItem, Customer, Data, Item, Order, Status, Vehicle } from "./types";
import { diasAtras } from "./util";

// Dados 100% fictícios (nomes, placas e telefones inventados).
const nomes = ["Helena Prado", "Marcos Vilela", "Beatriz Nogueira", "Rafael Tonet", "Luciana Aguiar", "Otávio Brandão", "Camila Ferrante", "Diego Moura", "Patrícia Salles", "Wagner Lemos", "Isadora Cunha", "Heitor Castanho"];
const cidades = ["Curitiba", "São José dos Pinhais", "Pinhais", "Colombo", "Araucária"];
export const clientes: Customer[] = nomes.map((nome, i) => ({
  id: `c${i + 1}`, nome, cidade: cidades[i % cidades.length],
  tel: `(41) 9${String(1000 + i * 137).padStart(4, "0")}-${String(2000 + i * 391).slice(0, 4)}`,
  email: `${nome.split(" ")[0].toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}@exemplo.test`,
  desde: diasAtras(900 - i * 61),
}));

const carros: [string, string, number, string, number][] = [
  ["Fiat", "Argo Drive", 2021, "Branco", 48200], ["Volkswagen", "Polo TSI", 2022, "Cinza", 31500], ["Chevrolet", "Onix Plus", 2020, "Prata", 67800],
  ["Toyota", "Corolla XEi", 2019, "Preto", 92400], ["Honda", "HR-V EXL", 2021, "Branco", 54100], ["Hyundai", "HB20 Comfort", 2018, "Vermelho", 103900],
  ["Jeep", "Renegade", 2020, "Verde", 71300], ["Renault", "Kwid Zen", 2023, "Laranja", 14800], ["Ford", "Ranger XLS", 2017, "Prata", 148200],
  ["Nissan", "Kicks SV", 2022, "Azul", 29700], ["Volkswagen", "Gol 1.0", 2015, "Branco", 134600], ["Fiat", "Toro Freedom", 2021, "Cinza", 58900],
  ["Chevrolet", "Tracker LT", 2023, "Preto", 18200], ["Toyota", "Hilux SRV", 2020, "Branco", 88000], ["Honda", "Civic Sport", 2018, "Prata", 112400],
];
const letras = "ABCDEFGHJKLMNPRSTUVXZ";
export const veiculos: Vehicle[] = carros.map(([marca, modelo, ano, cor, km], i) => ({
  id: `v${i + 1}`, marca, modelo, ano, cor, km,
  placa: i % 4 === 3 ? `${letras[i]}${letras[i + 3]}${letras[i + 5]}${1200 + i * 73}` : `${letras[i]}${letras[(i * 3) % 21]}${letras[(i * 5 + 2) % 21]}${i % 9}${letras[(i * 7) % 21]}${(i * 13) % 10}${(i * 7) % 10}`,
  clienteId: `c${(i % clientes.length) + 1}`,
}));

const S = (desc: string, preco: number) => ({ tipo: "servico" as const, desc, preco });
const P = (desc: string, preco: number) => ({ tipo: "peca" as const, desc, preco });
const base = [
  S("Troca de óleo e filtro (mão de obra)", 90), S("Alinhamento e balanceamento", 160), S("Revisão de freios", 220), S("Diagnóstico com scanner", 140),
  S("Troca de correia dentada", 380), S("Troca de amortecedores (par)", 320), S("Higienização do ar-condicionado", 180), S("Troca de embreagem", 650),
  P("Óleo 5W30 sintético (L)", 54), P("Filtro de óleo", 38), P("Filtro de ar", 46), P("Pastilha de freio (jogo)", 185), P("Disco de freio dianteiro (par)", 340),
  P("Kit correia dentada + tensor", 520), P("Amortecedor dianteiro (un)", 290), P("Vela de ignição (un)", 32), P("Bateria 60Ah", 489), P("Kit de embreagem", 890), P("Fluido de freio DOT4", 42),
];
export const catalogo: CatalogItem[] = base.map((b, i) => ({ id: `k${i + 1}`, ...b }));

const queixas = ["Troca de óleo e filtros", "Barulho ao frear", "Luz da injeção acesa", "Carro puxando para a direita", "Ar-condicionado sem gelar", "Troca da correia dentada", "Balanço excessivo em lombadas", "Pedal da embreagem duro", "Revisão dos 10 mil km", "Bateria descarregando"];
const pacotes: number[][] = [[0, 8, 9, 10], [2, 11, 18], [3, 15], [1], [6], [4, 13], [5, 14, 14], [7, 17], [0, 8, 9], [3, 16]];
const statusSeq: Status[] = ["orcamento", "aprovado", "em_servico", "aguardando_peca", "pronto", "em_servico", "orcamento", "aprovado", "pronto", "recusado"];

let n = 0;
const monta = (vi: number, dias: number, status: Status, p: number): Order => {
  n++;
  const itens: Item[] = pacotes[p].map((ci, j) => {
    const c = catalogo[ci];
    return { id: `i${n}_${j}`, tipo: c.tipo, desc: c.desc, preco: c.preco, qtd: c.desc.includes("Óleo") ? 4 : c.desc.includes("Vela") ? 4 : c.desc.includes("Amortecedor dianteiro") ? 2 : 1 };
  });
  const fim = status === "entregue";
  return {
    id: `o${n}`, num: 1000 + n, veiculoId: `v${vi + 1}`, status, abertura: diasAtras(dias), previsao: diasAtras(dias - 2 - (n % 3)),
    fechamento: fim ? diasAtras(Math.max(0, dias - 2)) : undefined, km: Math.max(1000, veiculos[vi].km - dias * 38),
    queixa: queixas[p], itens, desconto: n % 5 === 0 ? 30 : 0, obs: "",
  };
};

const ordens: Order[] = [];
// histórico entregue: ~5 meses, para alimentar o gráfico e o histórico por placa
for (let i = 0; i < 34; i++) ordens.push(monta(i < 12 ? (i * 4) % veiculos.length : (i * 4) % 9, Math.round(148 - i * 4.4), "entregue", i % pacotes.length));
// em curso hoje
for (let i = 0; i < 10; i++) ordens.push(monta((i * 2 + 1) % veiculos.length, i % 5, statusSeq[i], (i + 3) % pacotes.length));
// um atrasado
ordens.push(monta(8, 7, "aguardando_peca", 5));
export const seed = (): Data => structuredClone({ clientes, veiculos, ordens, catalogo });
