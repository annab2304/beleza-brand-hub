import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { safeRedirect } from "@/lib/auth";
import { whatsappUrl } from "@/lib/contact";

describe("rotas novas", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
  it.each(["/login", "/cadastro", "/minha-conta", "/checkout", "/pedido/abc", "/api/mercadopago/webhook"])("%s existe", (path) => {
    expect(router.matchRoutes(path).at(-1)?.routeId).not.toBe(rootRouteId);
  });
});

describe("safeRedirect", () => {
  it("só aceita caminhos internos", () => {
    expect(safeRedirect("/checkout")).toBe("/checkout");
    expect(safeRedirect("https://evil.test")).toBe("/minha-conta");
    expect(safeRedirect("//evil.test")).toBe("/minha-conta");
    expect(safeRedirect(undefined)).toBe("/minha-conta");
  });
});

describe("contato", () => {
  it("monta o link do WhatsApp com o número internacional", () => {
    expect(whatsappUrl()).toBe("https://wa.me/5511988266483");
    expect(whatsappUrl("Olá!")).toBe("https://wa.me/5511988266483?text=Ol%C3%A1!");
  });
});
