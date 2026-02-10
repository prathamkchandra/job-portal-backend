import { Router, Response } from "express";
import prisma from "../prisma";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { requireRecruiter } from "../middlewares/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRecruiter,
  async (req: AuthRequest, res: Response) => {
    const { title, description, requiredSkills } = req.body;

    if (!title || !description || !requiredSkills) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requiredSkills,
        recruiterId: req.user!.userId
      }
    });

    res.status(201).json(job);
  }
);

router.get(
  "/my",
  authenticate,
  requireRecruiter,
  async (req: AuthRequest, res: Response) => {
    const jobs = await prisma.job.findMany({
      where: {
        recruiterId: req.user!.userId
      }
    });

    res.json(jobs);
  }
);

router.get("/", async (_req, res) => {
  const jobs = await prisma.job.findMany({
    where: { isActive: true }
  });

  res.json(jobs);
});

export default router;
