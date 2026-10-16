// Embalagem padrão de UMA peça, usada para cotar o frete no Melhor Envio.
// O catálogo não tem peso nem medidas por produto; ajuste aqui conforme a sua embalagem real.
// Medidas em centímetros e peso em quilos. (16 × 11 × 2 cm é o mínimo aceito pelos Correios.)
export const DEFAULT_PACKAGE = {
  length: 16,
  width: 11,
  height: 2,
  weight: 0.1,
};

export type ShippingOption = {
  id: number;
  name: string;
  company: string;
  price: number;
  days: number;
};
