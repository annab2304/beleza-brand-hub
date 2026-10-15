// Dados de contato da marca. Para trocar número ou perfil, edite só aqui.
export const INSTAGRAM_HANDLE = "bemdetalhes";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

// Formato internacional (55 = Brasil, 11 = DDD), sem símbolos — exigido pelo wa.me.
export const WHATSAPP_NUMBER = "5511988266483";
export const WHATSAPP_DISPLAY = "(11) 98826-6483";

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
