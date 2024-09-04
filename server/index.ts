import MongoIO from "./config/MongoIO";

const mongo = new MongoIO();

export function getMessage (error: any): string {
  let message = "Unknown Error";
  if (error instanceof Error) message = error.message;
  return message;
}

(async () => {
  await mongo.connect();
})();

export {
  mongo
}