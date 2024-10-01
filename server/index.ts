import MongoIO from "./config/MongoIO";
import { v2 as cloudinary } from 'cloudinary';
import Ably from "ably";

const mongo = new MongoIO();
(async () => {await mongo.connect()})();

const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret, ablyRoot } = useRuntimeConfig();

// Configuration
cloudinary.config({ 
    secure: true,
    cloud_name: cloudinaryCloudName, 
    api_key: cloudinaryApiKey, 
    api_secret: cloudinaryApiSecret,
});

// Create the client
const ably = new Ably.Realtime(ablyRoot);

function getMessage (error: any): string {
  let message = "Unknown Error";
  if (error instanceof Error) message = error.message;
  return message;
}

export {
  ably,
  cloudinary,
  mongo,

  getMessage,
}