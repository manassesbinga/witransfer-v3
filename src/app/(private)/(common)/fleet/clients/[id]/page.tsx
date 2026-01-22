
import { getClientByIdAction } from "@/actions/private/clients/actions";
import ClientDetails from "@/components/details/ClientDetails";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getClientByIdAction(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const client = result.data;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-none hover:bg-slate-100">
                    <Link href="/fleet/clients">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900">Detalhes do Cliente</h1>
                    <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">ID: {id}</p>
                </div>
            </div>

            <ClientDetails client={client} />
        </div>
    );
}
