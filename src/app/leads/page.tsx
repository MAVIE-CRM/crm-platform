import { getLeads } from "@/actions/leads";
import { LeadsTable } from "@/components/leads/leads-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload } from "lucide-react";
import { AddLeadDialog } from "@/components/leads/add-lead-dialog";
import { DeleteAllLeadsButton } from "@/components/leads/delete-all-leads-button";

export default async function LeadsPage() {
    const leads = await getLeads();

    return (
        <div className="space-y-8 h-full px-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">Elenco Lead</h2>
                    <p className="text-slate-400 font-medium text-sm mt-2">Gestisci e monitora tutti i tuoi lead in un unico posto.</p>
                </div>
                <div className="flex gap-3">
                    <DeleteAllLeadsButton />
                    <Button variant="outline" asChild>
                        <Link href="/leads/import">
                            <Upload className="mr-2 h-4 w-4" />
                            Importa
                        </Link>
                    </Button>
                    <AddLeadDialog />
                </div>
            </div>

            <LeadsTable leads={leads} />
        </div>
    );
}
