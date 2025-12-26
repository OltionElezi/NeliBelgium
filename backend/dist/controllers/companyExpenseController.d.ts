import { Request, Response } from 'express';
export declare const getAllCompanyExpenses: (req: Request, res: Response) => Promise<void>;
export declare const getCompanyExpenseById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCompanyExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCompanyExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCompanyExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getExpenseSummary: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=companyExpenseController.d.ts.map