import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const requireRecruiter = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "recruiter") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
