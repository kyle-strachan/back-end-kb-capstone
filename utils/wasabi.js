import { S3Client } from "@aws-sdk/client-s3";

export const wasabi = new S3Client({
  region: "ca-central-1",
  endpoint: "https://s3.ca-central-1.wasabisys.com",
  credentials: {
    accessKeyId: process.env.WASABI_KEY,
    secretAccessKey: process.env.WASABI_SECRET,
  },
});
