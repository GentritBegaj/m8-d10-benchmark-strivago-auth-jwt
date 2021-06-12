import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  forbiddenErrorHandler,
  catchAllErrorHandler,
} from "./errorHandlers.js";
import mongoose from "mongoose";
import usersRoutes from "./services/user/index.js";
import accommodationsRoutes from "./services/accommodation/index.js";

const server = express();

const port = process.env.PORT || 3001;

server.use(cors());
server.use(express.json());
server.use("/users", usersRoutes);
server.use("/accommodations", accommodationsRoutes);

console.table(listEndpoints(server));

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(forbiddenErrorHandler);
server.use(catchAllErrorHandler);

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => console.log(`Server is running on port ${port}`))
  )
  .catch((err) => console.log(err));
