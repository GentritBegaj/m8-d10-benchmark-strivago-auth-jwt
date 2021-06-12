import UserModel from "../services/user/schema.js";
import { verifyJWT } from "./tools.js";

export const jwtAuthMiddleware = async (req, res, next) => {
  try {
    //Extract the token from the headers
    const token = req.header("Authorization").replace("Bearer ", "");

    //Verify if token is valid
    const decoded = await verifyJWT(token);

    //Check if user with ID extracted from token payload exists
    const user = await UserModel.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    const err = new Error("Please authenticate");
    err.httpStatusCode = 401;
    next(err);
  }
};

// export const adminOnlyMiddleware = async (req, res, next) => {
//   if (req.user && req.user.role === "Admin") next();
//   else {
//     const err = new Error("You need Admin privileges to perform this action");
//     err.httpStatusCode = 403;
//     next(err);
//   }
// };
