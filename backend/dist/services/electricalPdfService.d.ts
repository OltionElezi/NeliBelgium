import { ElectricalProject, ElectricalDiagram, Client, Company } from '@prisma/client';
type ProjectWithDetails = ElectricalProject & {
    client: Client;
    diagrams: ElectricalDiagram[];
};
export declare const generateElectricalPdf: (project: ProjectWithDetails, company: Company) => Promise<Buffer>;
export {};
//# sourceMappingURL=electricalPdfService.d.ts.map