import { Request, Response } from 'express';
export declare const getAllWorkers: (req: Request, res: Response) => Promise<void>;
export declare const getWorkerById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createWorker: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateWorker: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteWorker: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=workerController.d.ts.map