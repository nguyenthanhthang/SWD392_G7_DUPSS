import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    email: string;
    username: string;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Không có quyền truy cập" 
    });
  }

  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined in environment variables");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY) as {
      _id: Types.ObjectId;
      email: string;
      username: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
        message: "Không có quyền truy cập" 
    });
  }
}; 