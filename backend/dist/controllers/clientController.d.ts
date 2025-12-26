import { Request, Response } from 'express';
export declare const getAllClients: (req: Request, res: Response) => Promise<void>;
export declare const getClientById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createClient: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateClient: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteClient: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=clientController.d.ts.map