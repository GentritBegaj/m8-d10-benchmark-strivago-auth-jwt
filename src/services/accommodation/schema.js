import mongoose from "mongoose";

const { Schema, model } = mongoose;

const AccommodationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  maxGuests: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  host: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

export default model("Accommodation", AccommodationSchema);
