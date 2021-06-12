import { Router } from "express";
import { jwtAuthMiddleware } from "../../auth/index.js";
import UserModel from "./schema.js";
import { body, validationResult } from "express-validator";
import { authenticate, refreshTokens, verifyJWT } from "../../auth/tools.js";

const router = Router();

router.post(
  "/register",
  body("password").exists().isLength({ min: 6 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Password validation failed");
      error.httpStatusCode = 400;
      next(error);
    }
    try {
      const newUser = new UserModel(req.body);
      const { _id } = await newUser.save();

      res.status(201).send(_id);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.checkCredentials(email, password);
  if (user) {
    const tokens = await authenticate(user);
    res.status(200).send(tokens);
  } else {
    res.status(401).send("Error while logging in");
  }
});

router.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.body.refreshToken;
  if (!oldRefreshToken) {
    const err = new Error("Refresh token missing");
    err.httpStatusCode = 400;
    next(err);
  } else {
    try {
      const newTokens = await refreshTokens(oldRefreshToken);
      res.send(newTokens);
    } catch (error) {
      console.log(error);
      const err = new Error(error);
      err.httpStatusCode = 401;
      next(err);
    }
  }
});

router.get("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const users = await UserModel.find().populate("accommodations");
    res.send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/me", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id).populate(
      "accommodations"
    );
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/me/accommodations", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id).populate(
      "accommodations"
    );
    res.status(200).send(user.accommodations);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/me", jwtAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user, "AAAAAAAAA");
    const modifiedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { ...req.body },
      {
        runValidators: true,
        new: true,
      }
    );
    if (!modifiedUser) {
      const error = new Error("User does not exist");
      error.httpStatusCode = 404;
      next(error);
    }
    res.status(202).send(modifiedUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/me", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const userToDelete = await UserModel.findByIdAndDelete(req.user._id);
    if (!userToDelete) {
      const error = new Error("User does not exist");
      error.httpStatusCode = 404;
      next(error);
    }
    res.status(204).send("User deleted");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/logout", jwtAuthMiddleware, async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.body.refreshToken;
  if (!refreshToken) {
    const err = new Error("Refresh token missing");
    err.httpStatusCode = 400;
    next(err);
  } else {
    try {
      const newTokens = await refreshTokens(oldRefreshToken);
      res.send(newTokens);
    } catch (error) {
      const err = new Error(error);
      err.httpStatusCode = 401;
      next(err);
    }
  }
});

export default router;
