import { Request, Response } from 'express';
export declare const getTrash: (req: Request, res: Response) => Promise<void>;
export declare const restoreItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const permanentDelete: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const emptyTrash: (req: Request, res: Response) => Promise<void>;
export declare const cleanupOldTrash: () => Promise<void>;
//# sourceMappingURL=trashController.d.ts.map