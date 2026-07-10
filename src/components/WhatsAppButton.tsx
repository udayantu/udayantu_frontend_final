import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

export const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "919936112992"; // Format: country code + number without + or spaces
    const message = encodeURIComponent("Hello UdaYantu team, I'm interested in your training and placement programs. Can I get more details?");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[55] rounded-full w-14 h-14 p-0 bg-[#25D366] hover:bg-[#20ba5a] shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.4)] border border-[#25D366]/20 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white transition-transform duration-300 group-hover:rotate-12" />
    </Button>
  );
};
