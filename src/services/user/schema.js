import mongoose from "mongoose";

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  accommodations: [{ type: Schema.Types.ObjectId, ref: "Accommodation" }],
});

UserSchema.pre("save", async function (next) {
  const newUser = this;

  const plainPW = newUser.password;
  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.__v;
  delete userObject.refreshToken;

  return userObject;
};

export default model("User", UserSchema);
