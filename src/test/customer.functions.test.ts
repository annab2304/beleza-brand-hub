import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({ createServerFn: () => {
  const builder = { middleware: () => builder, inputValidator: () => builder, handler: (fn: unknown) => fn };
  return builder;
} }));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
import { getCustomerProfile, saveCustomerProfile } from "@/lib/customer.functions";

describe("salvar e ler o perfil somente da cliente autenticada", () => {
  beforeEach(() => vi.clearAllMocks());
  it("salva nome, telefone e endereço no ID validado, nunca no ID enviado", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const address = { cep: "01001000", street: "Praça da Sé", number: "10", complement: "", neighborhood: "Sé", city: "São Paulo", state: "SP" };
    const fn = saveCustomerProfile as unknown as (input: unknown) => Promise<unknown>;
    await fn({ data: { customer: { name: "Ana Dias", phone: "11999999999", email: "ana@example.com" }, address, id: "other-user" }, context: { userId: "authenticated-user", supabase: { from: () => ({ upsert }) } } });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ id: "authenticated-user", full_name: "Ana Dias", phone: "11999999999", shipping_address: address }));
  });
  it("lê somente o perfil do ID validado", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { full_name: "Ana Dias" }, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const fn = getCustomerProfile as unknown as (input: unknown) => Promise<unknown>;
    expect(await fn({ context: { userId: "authenticated-user", supabase: { from: () => ({ select: () => ({ eq }) }) } } })).toEqual({ full_name: "Ana Dias" });
    expect(eq).toHaveBeenCalledWith("id", "authenticated-user");
  });
});