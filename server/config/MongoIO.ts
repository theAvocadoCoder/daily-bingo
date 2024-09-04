/***********************************************
 * Class MongoIO implements all mongodb I-O
 */
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import MongoInterface from "../interfaces/MongoInterface";
import User from "../interfaces/User";
import Card from "../interfaces/Card";

/*************************************************
 * Class Properties
 */
export default class MongoIO implements MongoInterface {
  private client?: MongoClient;
  private db?: Db;
  private userCollection?: Collection;
  private cardCollection?: Collection;

  /*************************************************
   * Constructor
   */
  constructor() {}

  /***************************************************
   * Connect to mongodb database
   */

  public async connect(): Promise<void> {
    const connectionString = process.env.ATLAS_URI as string;
    const dbName = process.env.DB_NAME;

    this.client = new MongoClient(connectionString);
    await this.client.connect();
    this.db = this.client.db(dbName);
    this.userCollection = this.db.collection("users");
    this.cardCollection = this.db.collection("cards");

    console.log("Database", dbName, "Connected");
  }

  /***************************************************
   * Disconnect from the database
   */

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = undefined;
      this.db = undefined;
    }
  }

  /****************************************************
   * Get user
   */
  public async findUser(id: string): Promise<User> {
    if (!this.userCollection) {
      throw new Error("findUser - Database not connected");
    }
    const userId = new ObjectId(id);
    const pipeline = [
      {$match: {_id: userId}}
    ]

    let results: User | null;
    results = await this.userCollection.aggregate<User>(pipeline).next();

    if (results === null) {
      throw new Error("User not found " + id);
    } else {
      return results;
    }
  }

  /***********************************************
   * Get a card
   */
  public async findCard(id: string): Promise<Card> {
    if (!this.cardCollection) {
      throw new Error("findCard - Database not connected");
    }
    const cardId = new ObjectId(id);
    const pipeline = [
      {$match: {_id: cardId}}
    ]

    let results: Card | null;
    results = await this.cardCollection.aggregate<Card>(pipeline).next();

    if (results === null) {
      throw new Error("Card not found " + id);
    } else {
      return results;
    }
  }
}
