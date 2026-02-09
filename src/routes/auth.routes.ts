import { Router } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  // 1. basic validation
  if (!email || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // 2. check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(409).json({ message: "Email already exists" });
  }

  // 3. hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role
    }
  });

  res.status(201).json({
    message: "User registered",
    userId: user.id
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    "SECRET_KEY",
    { expiresIn: "1d" }
  );

  res.json({ token });
});

export default router;
