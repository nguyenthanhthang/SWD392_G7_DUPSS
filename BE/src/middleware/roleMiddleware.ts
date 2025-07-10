import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware";

export const ROLES = {
  ADMIN: "admin",
  CONSULTANT: "consultant",
  CUSTOMER: "customer"
} as const;

export const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: "Không có quyền truy cập" 
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false,
          message: "Bạn không đúng quyền truy cập" 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Lỗi server" 
      });
    }
  };
}; 