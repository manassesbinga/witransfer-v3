"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, FileText, Download } from "lucide-react";
import { verifyDocumentAction, rejectDocumentAction } from "@/actions/private/documents/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocumentVerificationModalProps {
  document: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentVerificationModal({
  document,
  isOpen,
  onClose,
}: DocumentVerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "verify" | "reject">("preview");
  const router = useRouter();

  if (!document) return null;

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyDocumentAction(document.id);
      if (result.success) {
        toast.success("Documento verificado e aprovado!");
        router.refresh();
        onClose();
      } else {
        toast.error("Erro ao verificar documento.");
      }
    } catch (error) {
      toast.error("Erro inesperado.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const result = await rejectDocumentAction(document.id);
      if (result.success) {
        toast.success("Documento rejeitado. Parceiro será notificado para revisão.");
        router.refresh();
        onClose();
      } else {
        toast.error("Erro ao rejeitar documento.");
      }
    } catch (error) {
      toast.error("Erro inesperado.");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl rounded-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900">
            Verificar Documento
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "px-4 py-2 text-sm font-black tracking-widest transition-colors",
              activeTab === "preview"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            PRÉ-VISUALIZAÇÃO
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className={cn(
              "px-4 py-2 text-sm font-black tracking-widest transition-colors",
              activeTab === "verify"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            APROVAR
          </button>
          <button
            onClick={() => setActiveTab("reject")}
            className={cn(
              "px-4 py-2 text-sm font-black tracking-widest transition-colors",
              activeTab === "reject"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            REJEITAR
          </button>
        </div>

        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div className="space-y-4">


            {/* Document Display */}
            <div className="border border-slate-200 rounded-none overflow-hidden bg-slate-50">
              <div className="flex items-center justify-between p-4 bg-slate-100 border-b border-slate-200">
                <div className="text-xs font-black text-slate-600 uppercase tracking-widest">
                  Visualização do Documento
                </div>
                {document.document_url && (
                  <a
                    href={document.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Abrir em Nova Aba
                  </a>
                )}
              </div>

              {document.document_url ? (
                <div className="w-full h-[600px] bg-white overflow-y-auto">
                  {document.document_url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                    <img
                      src={document.document_url}
                      alt="Document Preview"
                      className="w-full h-auto object-contain"
                    />
                  ) : (
                    <iframe
                      src={`${document.document_url}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full"
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-96 flex flex-col items-center justify-center gap-4 bg-white">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Nenhum Documento Anexado</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto leading-relaxed">
                      O parceiro ainda não enviou os documentos necessários para verificação da conta.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === "verify" && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-none">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-900">
                    Marcar como Verificado
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Confirme se o documento está correto e pode ser aprovado.
                  </p>
                </div>
              </div>
            </div>



            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-none font-black h-11"
            >
              {isVerifying ? "Verificando..." : <><CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar como Verificado</>}
            </Button>
          </div>
        )}

        {/* Reject Tab */}
        {activeTab === "reject" && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-none">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-900">
                    Rejeitar Documento
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    O parceiro será notificado para fazer upload de um novo documento.
                  </p>
                </div>
              </div>
            </div>



            <Button
              onClick={handleReject}
              disabled={isRejecting}
              variant="destructive"
              className="w-full rounded-none font-black h-11"
            >
              {isRejecting ? "Rejeitando..." : <><XCircle className="w-4 h-4 mr-2" /> Rejeitar Documento</>}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
