import { Request, Response } from 'express';
export declare const getWorkerExpenses: (req: Request, res: Response) => Promise<void>;
export declare const getAllExpenses: (req: Request, res: Response) => Promise<void>;
export declare const createExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=expenseController.d.ts.map