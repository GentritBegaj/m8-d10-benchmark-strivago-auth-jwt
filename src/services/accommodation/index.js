import { Router } from "express";
import AccommodationModel from "./schema.js";
import UserModel from "../user/schema.js";
import { jwtAuthMiddleware } from "../../auth/index.js";

const router = Router();

router.get("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const accommodations = await AccommodationModel.find().populate({
      path: "host",
      populate: { path: "accommodations" },
    });
    res.status(200).send(accommodations);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:accommodationId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const accommodation = await AccommodationModel.findById(req.params.id);
    if (!accommodation) {
      const error = new Error("Accommodation with this ID does not exist");
      error.httpStatusCode = 404;
      next(error);
    }
    res.status(200).send(accommodation);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const newAccommodationObject = new AccommodationModel({
      ...req.body,
      host: req.user._id,
    });
    const newAccommodationAdded = await newAccommodationObject.save();
    const hostToUpdate = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          accommodations: newAccommodationAdded._id,
        },
      },
      { runValidators: true, new: true }
    );
    res.status(201).send(newAccommodationAdded);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/:accommodationId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const accommodationToUpdate = await AccommodationModel.findById(
      req.params.accommodationId
    );
    if (accommodationToUpdate.host.toString() === req.user._id.toString()) {
      const updatedAccommodation = await AccommodationModel.findByIdAndUpdate(
        req.params.accommodationId,
        { ...req.body },
        {
          runValidators: true,
          new: true,
        }
      );
      res.status(202).send(updatedAccommodation);

      //   res.status(403).send("No");
    } else {
      const error = new Error();
      error.httpStatusCode = 403;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete(
  "/:accommodationId",
  jwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const accommodationToDelete = await AccommodationModel.findById(
        req.params.accommodationId
      );
      if (accommodationToDelete.host.toString() !== req.user._id.toString()) {
        const error = new Error(
          "Accommodation details can only be deleted from the host of the accommodation"
        );
        error.httpStatusCode = 403;
        next(error);
      }
      await AccommodationModel.findByIdAndDelete(req.params.accommodationId);
      res.send("Deleted!");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default router;
