import { Router, Response } from "express";
import prisma from "../prisma";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

/**
 * POST /applications
 * Candidate applies to a job
 */
router.post(
  "/",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "candidate") {
      return res.status(403).json({ message: "Only candidates can apply" });
    }

    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    try {
      const application = await prisma.application.create({
        data: {
          jobId,
          candidateId: req.user.userId
        }
      });

      res.status(201).json(application);
    } catch (error) {
      // unique constraint: already applied
      res.status(409).json({ message: "Already applied to this job" });
    }
  }
);

/**
 * GET /applications/job/:jobId
 * Recruiter views applicants for their job
 */
router.get(
  "/job/:jobId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "recruiter") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const jobId = Number(req.params.jobId);

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        recruiterId: req.user.userId
      }
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    res.json(applications);
  }
);

/**
 * PATCH /applications/:id/status
 * Recruiter updates application status
 */
router.patch(
  "/:id/status",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "recruiter") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const applicationId = Number(req.params.id);
    const { status } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application || application.job.recruiterId !== req.user.userId) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    res.json(updated);
  }
);

/**
 * GET /applications/my
 * Candidate views their own applications
 */
router.get(
  "/my",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "candidate") {
      return res.status(403).json({ message: "Only candidates can view this" });
    }

    const applications = await prisma.application.findMany({
      where: {
        candidateId: req.user.userId
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            requiredSkills: true
          }
        }
      },
      orderBy: {
        appliedAt: "desc"
      }
    });

    res.json(applications);
  }
);

export default router;
