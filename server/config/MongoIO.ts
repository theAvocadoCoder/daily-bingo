/***********************************************
 * Class MongoIO implements all mongodb I-O
 */
import { MongoClient, Db } from "mongodb";
import MongoInterface from "../interfaces/MongoInterface";

/*************************************************
 * Class Properties
 */
export default class MongoIO implements MongoInterface {
  private client?: MongoClient;
  private db?: Db;

  /*************************************************
   * Constructor
   */
  constructor() {}

  /***************************************************
   * Connect to mongodb database
   */

  public async connect(): Promise<void> {
    const connectionString = process.env.ATLAS_URI as string;
    const dbName = "test";

    this.client = new MongoClient(connectionString);
    await this.client.connect();
    this.db = this.client.db(dbName);

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
}
