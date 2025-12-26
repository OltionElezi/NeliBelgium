import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: number;
    userEmail?: string;
}
export interface JwtPayload {
    userId: number;
    email: string;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const generateToken: (userId: number, email: string) => string;
//# sourceMappingURL=auth.d.ts.map