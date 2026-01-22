/** @format */

"use client";

import React from "react";
import { Trash2, LucideIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    title: string;
    description: string;
    itemName: string;
    itemLabel: string;
    icon?: LucideIcon;
    confirmText?: string;
    cancelText?: string;
}

export function DeleteConfirmation({
    open,
    onOpenChange,
    onConfirm,
    isDeleting = false,
    title,
    description,
    itemName,
    itemLabel,
    icon: Icon = Trash2,
    confirmText = "Confirmar Eliminação",
    cancelText = "Cancelar Operação",
}: DeleteConfirmationProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-none">
                <div className="bg-rose-600 p-6 flex flex-col items-center text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-none flex items-center justify-center mb-4 backdrop-blur-sm animate-pulse">
                        <Icon size={32} />
                    </div>
                    <DialogTitle className="text-xl font-black tracking-tighter uppercase mb-2 text-white">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-rose-100 font-medium">
                        {description}
                    </DialogDescription>
                </div>

                <div className="p-8 bg-white">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 mb-6 font-mono text-xs">
                        <div className="p-2 bg-slate-200 text-slate-600">
                            <Icon size={16} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-1 text-left">
                                {itemLabel}
                            </p>
                            <p className="text-slate-900 font-black text-sm text-left">
                                {itemName}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 font-black text-[10px] tracking-widest uppercase">
                        <Button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white h-12 rounded-none transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-200"
                        >
                            {isDeleting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : (
                                <Trash2 size={16} className="mr-2" />
                            )}
                            {confirmText}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="w-full h-12 rounded-none border border-slate-200 text-slate-400 hover:text-slate-900 transition-all"
                        >
                            {cancelText}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
