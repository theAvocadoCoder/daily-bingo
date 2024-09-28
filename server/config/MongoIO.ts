/***********************************************
 * Class MongoIO implements all mongodb I-O
 */
import { Collection, Db, InsertOneResult, MongoClient, ObjectId, UpdateFilter } from "mongodb";
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

    const randomFourDigits = Math.floor(Math.random() * 10000);
    
    let results: InsertOneResult;
    let newUser: User = {
      ...theUser,
      cards: [],
      display_name: `User${randomFourDigits}`,
      groups: [],
    };

    results = await this.userCollection.insertOne(theUser);
    let id = results.insertedId.toHexString();
    return await this.findUser(id);
  }

  /********************************************************************************
   * Update a user by ID
   * @param id 
   * @param data to update
   * @returns Updated User
   */
  public async updateUser(id: string, data: any, additionalFilters?: any): Promise<User> {
    // TODO: This method has gotten too vague and it no longer does just one thing. Figure out how to break it up
    if (!this.userCollection) {
      throw new Error("updateUser - Database not connected");
    }

    const MS_PER_MONTH = 2_629_746_000;

    const user = await this.findUser(id);
    if (
      data.username &&
      user.username_modified &&
      Date.now() - Date.parse(user.username_modified?.toDateString()) < MS_PER_MONTH
    ) {
      throw new Error("Username can only be updated once every 30 days");
    }

    const [field, value] = Object.entries(data)[0] as [keyof User, any];

    const userId = new ObjectId(id);
    const filter = !!additionalFilters ? { _id: userId, ...additionalFilters } : { _id: userId };
    let update: UpdateFilter<any>

    if (Array.isArray(user[field])) {
      // If document exists, delete
      if (user[field].find(entry => entry._id == value._id)) {
        console.log("The doc exists", field, value)
        update = { $pull: {
          [field]: value
        } }
      } else {
        // addToSet updates the field only if the value doesn't already exist in the array
        update = { $addToSet: data };
      }
    } else {
      update = { $set: data };
    }

    console.info("User %s updated with %s", userId, data)

    const result = await this.userCollection.updateOne(filter, update);
    if (!result) {
      throw new Error("Update User found No User to Update " + userId);
    }

    return this.findUser(id);
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

  /****************************************************
   * Insert a new card
   */

  public async insertCard(theCard: any): Promise<Card> {
    if (!this.cardCollection) {
      throw new Error("insertCard - Database not connected");
    }

    const results = await this.cardCollection.insertOne(theCard);
    let id = results.insertedId.toHexString();
    return await this.findCard(id);
  } 

  /********************************************************************************
   * Update a card by ID
   * @param id 
   * @param data to update
   * @returns Updated card
   */
  public async updateCard(id: string, data: any): Promise<Card> {
    if (!this.cardCollection) {
      throw new Error("updateCard - Database not connected");
    }

    const cardId = new ObjectId(id);
    const filter = { _id: cardId };
    const update = { $set: data };

    console.info("Card %s updated with %s", cardId, data)

    const result = await this.cardCollection.findOneAndUpdate(filter, update);
    if (!result) {
      throw new Error("Update card found No Card to Update " + cardId);
    }

    return this.findCard(id);
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
