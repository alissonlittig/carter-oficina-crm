import { describe, expect, it } from "vitest";
import { fmtPlaca, normPlaca, placaValida, proximo, totalOS } from "./util";

describe("placa", () => {
  it("normaliza e valida Mercosul e antiga", () => {
    expect(normPlaca("abc-1d23")).toBe("ABC1D23");
    expect(placaValida("ABC1D23")).toBe(true);
    expect(placaValida("ABC1234")).toBe(true);
    expect(placaValida("AB12345")).toBe(false);
  });
  it("formata placa antiga com hífen", () => {
    expect(fmtPlaca("ABC1234")).toBe("ABC-1234");
    expect(fmtPlaca("ABC1D23")).toBe("ABC1D23");
  });
});

describe("ordem de serviço", () => {
  it("soma itens e aplica desconto sem ficar negativo", () => {
    const itens = [
      { id: "1", tipo: "servico" as const, desc: "a", qtd: 1, preco: 100 },
      { id: "2", tipo: "peca" as const, desc: "b", qtd: 2, preco: 50 },
    ];
    expect(totalOS({ itens, desconto: 20 })).toBe(180);
    expect(totalOS({ itens, desconto: 999 })).toBe(0);
  });
  it("fluxo de status termina em entregue", () => {
    expect(proximo("orcamento")).toBe("aprovado");
    expect(proximo("entregue")).toBeNull();
    expect(proximo("recusado")).toBeNull();
  });
});
