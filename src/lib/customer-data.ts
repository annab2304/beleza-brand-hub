import { z } from "zod";

export const addressSchema = z.object({
  cep: z.string().regex(/^\d{8}$/, "CEP inválido"),
  street: z.string().trim().min(2).max(160),
  number: z.string().trim().min(1).max(20),
  complement: z.string().trim().max(80).default(""),
  neighborhood: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  state: z.string().regex(/^[A-Z]{2}$/),
});
export const customerSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(160),
  phone: z.string().regex(/^\d{10,11}$/, "Informe telefone com DDD"),
});
export const postalResponseSchema = z.object({
  logradouro: z.string(), bairro: z.string(), localidade: z.string(), uf: z.string().length(2),
});
export function parsePostalAddress(value: unknown) {
  const parsed = postalResponseSchema.safeParse(value);
  if (!parsed.success) throw new Error("CEP não encontrado. Confira o CEP ou preencha o endereço manualmente.");
  return { street: parsed.data.logradouro, neighborhood: parsed.data.bairro, city: parsed.data.localidade, state: parsed.data.uf };
}
export function savedAddress(value: unknown): Partial<z.infer<typeof addressSchema>> {
  const parsed = addressSchema.partial().safeParse(value);
  return parsed.success ? parsed.data : {};
}