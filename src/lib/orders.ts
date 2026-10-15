export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pagamento confirmado",
  preparing: "Em preparação",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  in_process: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const ORDER_STATUSES = ["pending", "paid", "preparing", "shipped", "delivered", "cancelled"] as const;

export type OrderOption = { name: string; value: string };

export type OrderItemRow = {
  id: string;
  name: string;
  options: unknown;
  image_url: string | null;
  unit_price: number;
  quantity: number;
};

export function parseOptions(value: unknown): OrderOption[] {
  return Array.isArray(value)
    ? value.filter((o): o is OrderOption => !!o && typeof o === "object" && "name" in o && "value" in o)
    : [];
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
