"use client";

import Link from "next/link";
import { ShieldCheck, Mail, Phone, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#003580] text-white pt-12 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-white/20 shadow-2xl transition-transform group-hover:scale-110">
                <img
                  src="/logo.png"
                  alt="WiTransfer Logo"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tighter">
                  WiTransfer
                </span>
                <span className="text-[10px] uppercase font-semibold text-blue-200 tracking-widest mt-0.5">
                  Unique Experience
                </span>
              </div>
            </Link>
            <p className="text-sm text-blue-100/80 font-medium leading-relaxed max-w-xs">
              A WiTransfer é a sua parceira de confiança para aluguer de
              viaturas e transfers em Angola. Garantimos segurança, conforto e
              os melhores preços do mercado.
            </p>
          </div>

          {/* Quicklinks */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/90">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-blue-100/80 font-medium">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/90">
              Contacto
            </h4>
            <div className="space-y-3 text-sm text-blue-100/80 font-medium">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>+244 923 123 456</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>geral@witransfer.co.ao</span>
              </div>
              <div className="flex gap-4 pt-2">
                <Instagram className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
                <Facebook className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-blue-200/60 font-medium uppercase tracking-widest">
            © 2025 WiTransfer Angola. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-sm">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              Site 100% Seguro
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
