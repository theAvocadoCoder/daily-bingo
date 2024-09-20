import MongoIO from "./config/MongoIO";

const mongo = new MongoIO();
(async () => {await mongo.connect()})();

function getMessage (error: any): string {
  let message = "Unknown Error";
  if (error instanceof Error) message = error.message;
  return message;
}

export {
  mongo,

  getMessage,
}