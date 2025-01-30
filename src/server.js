import app from "./app.js";
import { connectMongoDB } from "./infrastructure/db/MongoDBConnection.js";

const PORT = process.env.PORT || 3000;

connectMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
