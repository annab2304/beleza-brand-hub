import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { addressSchema, customerSchema, parsePostalAddress } from "@/lib/customer-data";

export const lookupCep = createServerFn({ method: "GET" })
  .inputValidator(z.object({ cep: z.string().regex(/^\d{8}$/) }))
  .handler(async ({ data }) => {
    const response = await fetch(`https://viacep.com.br/ws/${data.cep}/json/`, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Não foi possível consultar o CEP. Preencha o endereço manualmente.");
    return parsePostalAddress(await response.json());
  });

export const getCustomerProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("profiles")
      .select("full_name,phone,shipping_address").eq("id", context.userId).maybeSingle();
    if (error) throw new Error("Não foi possível carregar seus dados salvos.");
    return data;
  });

export const saveCustomerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ customer: customerSchema, address: addressSchema }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId, full_name: data.customer.name, phone: data.customer.phone,
      shipping_address: data.address, updated_at: new Date().toISOString(),
    });
    if (error) throw new Error("Não foi possível salvar seus dados. Tente novamente.");
    return { saved: true };
  });