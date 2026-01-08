import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalCancelarViagemProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  viagemId: string;
}

const ModalCancelarViagem: React.FC<ModalCancelarViagemProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  viagemId 
}) => {
  const [motivo, setMotivo] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-slide-in-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Cancelar Viagem
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Tem certeza que deseja cancelar a viagem <span className="font-mono font-semibold">{viagemId}</span>? 
            Esta ação não pode ser desfeita.
          </p>
          
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo do Cancelamento
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px] resize-none"
            placeholder="Descreva o motivo do cancelamento..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={() => onConfirm(motivo)}
            disabled={!motivo.trim()}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Cancelamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCancelarViagem;
