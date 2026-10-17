import { describe, expect, it } from "vitest";
import { addressSchema, customerSchema, parsePostalAddress, savedAddress } from "@/lib/customer-data";

describe("endereço por CEP", () => {
  it("preenche rua, bairro, cidade e estado sem inventar número ou complemento", () => {
    expect(parsePostalAddress({ logradouro: "Praça da Sé", bairro: "Sé", localidade: "São Paulo", uf: "SP" }))
      .toEqual({ street: "Praça da Sé", neighborhood: "Sé", city: "São Paulo", state: "SP" });
  });
  it("recusa CEP inexistente", () => {
    expect(() => parsePostalAddress({ erro: true })).toThrow();
  });
});
describe("dados privados da cliente", () => {
  it("recupera o endereço salvo para uma próxima compra", () => {
    const address = { cep: "01001000", street: "Praça da Sé", number: "10", complement: "Sala 2", neighborhood: "Sé", city: "São Paulo", state: "SP" };
    expect(savedAddress(address)).toEqual(address);
    expect(addressSchema.safeParse({ ...address, number: "" }).success).toBe(false);
  });
  it("valida nome e telefone antes de salvar na conta", () => {
    expect(customerSchema.parse({ name: "Ana Dias", email: "ana@example.com", phone: "11999999999" }).name).toBe("Ana Dias");
    expect(customerSchema.safeParse({ name: "Ana Dias", email: "ana@example.com", phone: "" }).success).toBe(false);
  });
});