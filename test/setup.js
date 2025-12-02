// test/setup.js
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, {
    dbName: "testdb",
  });
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
