import { MessageCircle } from "lucide-react";

import { whatsappUrl } from "@/lib/contact";

export function WhatsappButton() {
  return (
    <a
      href={whatsappUrl("Olá! Vim pelo site da Beleza em Detalhes e gostaria de ajuda.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com a Beleza em Detalhes pelo WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-cafe text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:h-14 sm:w-14"
    >
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
    </a>
  );
}
