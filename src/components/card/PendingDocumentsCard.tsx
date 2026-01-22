"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import DocumentVerificationModal from "@/components/modal/DocumentVerificationModal";
import { cn } from "@/lib/utils";

interface PendingDocumentsCardProps {
  documents: any[];
}

export default function PendingDocumentsCard({ documents }: PendingDocumentsCardProps) {
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const pendingCount = documents.filter(d => d.status === 'pending').length;

  if (pendingCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-slate-200/60 shadow-none rounded-none bg-gradient-to-br from-slate-50 to-white hover:border-slate-300 transition-all">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-none flex items-center justify-center bg-green-50 text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Todos os Documentos Verificados
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Nenhuma solicitação pendente no momento.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-2 border-amber-200/50 shadow-lg shadow-amber-100/30 rounded-none bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-all group">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-none flex items-center justify-center bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Solicitações de Verificação Pendentes
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 tracking-widest">
                    ({pendingCount})
                  </p>
                </div>
              </div>
              <Badge className="bg-amber-600 text-white border-none rounded-none font-black text-sm px-3 py-1">
                {pendingCount}
              </Badge>
            </div>

            {/* Documents List */}
            <div className="space-y-2 mt-6 mb-4">
              {documents
                .filter(d => d.status === 'pending')
                .slice(0, 3)
                .map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-none hover:border-amber-300 transition-colors group/item"
                  >
                    <div className="w-8 h-8 rounded-none flex items-center justify-center bg-amber-100 text-amber-600 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {doc.partner?.nome || "Parceiro Desconhecido"}
                        </p>
                        <Badge variant="outline" className="text-[9px] rounded-none border-amber-200 text-amber-700 bg-amber-50 flex-shrink-0">
                          {doc.document_type}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Upload: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleViewDocument(doc)}
                      size="sm"
                      variant="ghost"
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-none h-8 px-3 opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
            </div>

            {/* View All Button */}
            {pendingCount > 3 && (
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-none font-black h-10"
                onClick={() => {
                  // Navigate to documents page or expand list
                  window.location.href = "/admin/documents";
                }}
              >
                Ver Todos ({pendingCount})
              </Button>
            )}

            {pendingCount <= 3 && (
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-none font-black h-10"
                onClick={() => {
                  window.location.href = "/admin/documents";
                }}
              >
                Ir para Documentos
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Modal */}
      <DocumentVerificationModal
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDocument(null);
        }}
      />
    </>
  );
}
