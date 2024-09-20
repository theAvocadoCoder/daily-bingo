/***********************************************
 * Class MongoIO implements all mongodb I-O
 */
import { Collection, Db, InsertOneResult, MongoClient, ObjectId } from "mongodb";
import MongoInterface from "../interfaces/MongoInterface";
import User from "../interfaces/User";
import Card from "../interfaces/Card";
import Entry from "../interfaces/Entry";

/*************************************************
 * Class Properties
 */
export default class MongoIO implements MongoInterface {
  private client?: MongoClient;
  private db?: Db;
  private userCollection?: Collection<User>;
  private cardCollection?: Collection<Card>;
  private entryCollection?: Collection<Entry>;

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
    this.entryCollection = this.db.collection("entries");

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

    const results = await this.userCollection.aggregate<User>(pipeline).next();

    if (results === null) {
      throw new Error("User not found: " + id);
    } else {
      return results;
    }
  }

  /****************************************************
   * Get user by their email address
   */

  public async findUserByEmail(email: string): Promise<User | null> {
    if (!this.userCollection) {
      throw new Error("findUser - Database not connected");
    }
    
    const pipeline = [
      {$match: {email: email}}
    ]

    const results = await this.userCollection.aggregate<User>(pipeline).next();

    return results;
  }

  /****************************************************
   * Insert a new user
   */

  public async insertUser(theUser: {email: string, username: string}): Promise<User | null> {
    if (!this.userCollection) {
      throw new Error("findUser - Database not connected");
    }
    
    let results: InsertOneResult;
    let newUser: User;

    results = await this.userCollection.insertOne(theUser);
    let id = results.insertedId.toHexString();
    return await this.findUser(id);
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

    const results = await this.cardCollection.aggregate<Card>(pipeline).next();

    if (results === null) {
      throw new Error("Card not found: " + id);
    } else {
      return results;
    }
  }

  public async insertCard(theCard: any): Promise<Card> {
    if (!this.cardCollection) {
      throw new Error("insertCard - Database not connected");
    }

    const results = await this.cardCollection.insertOne(theCard);
    let id = results.insertedId.toHexString();
    return await this.findCard(id);
  } 

  /***************************************************************
   * Get phrases
   */
  public async findEntry(theme: string): Promise<Entry> {
    if (!this.entryCollection) {
      throw new Error("findEntry - Database not connected");
    }

    const pipeline = [
      {$match: {theme: theme}}
    ]

    let results: Entry | null;
    results = await this.entryCollection.aggregate<Entry>(pipeline).next();

    if (results === null) {
      throw new Error("Entry not found: " + theme);
    } else {
      return results;
    }
  }
}
