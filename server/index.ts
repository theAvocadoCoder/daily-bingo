import MongoIO from "./config/MongoIO";
import { v2 as cloudinary } from 'cloudinary';

const mongo = new MongoIO();

const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = useRuntimeConfig();

// Cloudinary Configuration
cloudinary.config({ 
    secure: true,
    cloud_name: cloudinaryCloudName, 
    api_key: cloudinaryApiKey, 
    api_secret: cloudinaryApiSecret,
});

function getMessage (error: any): string {
  let message = "Unknown Error";
  if (error instanceof Error) message = error.message;
  return message;
}

export {
  cloudinary,
  mongo,

  getMessage,
}