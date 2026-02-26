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
        <div className="space-y-4 h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-tight">Elenco Lead</h2>
                <div className="flex gap-2">
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
