// Dados de contato da marca. Para trocar número ou perfil, edite só aqui.
export const INSTAGRAM_HANDLE = "bemdetalhes";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

// Formato internacional (55 = Brasil, 11 = DDD), sem símbolos — exigido pelo wa.me.
export const WHATSAPP_NUMBER = "5511988266483";

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const CONTACT_EMAIL = "bemdetalhes@gmail.com";
export const mailtoUrl = (subject?: string) => `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
