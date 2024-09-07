import { ObjectId } from "mongodb";

export default interface User {
  _id: ObjectId;
  displayName: string;
  cards: {
    created: ObjectId[];
    played: ObjectId[];
  };
  groups: {
    groupName: string;
    groupId: ObjectId;
  }[];
  username: string;
}
