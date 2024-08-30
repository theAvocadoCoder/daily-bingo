import mongoose, { Schema } from "mongoose";

const uri = process.env.ATLAS_URI as string;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Atlas");
  } catch(e) {
    console.error("Error connecting to MongoDB Atlas:", e)
  }
}

// connectDB();

const cell = new Schema({
  id: { type: String, required: true },
  class: { type: String, required: true },
  value: { type: String, required: true },
  row: { type: Number, required: true },
  column: { type: Number, required: true },
  bDiagonal: { type: Boolean, required: true },
  fDiagonal: { type: Boolean, required: true },
  corner: { type: Boolean, required: true },
});

cell.path("row").validate(rowColumnValidate, "The card must be 5 x 5")

const card =  new Schema({
  userId: {type: String, default: process.env.DEFAULT_USER, required: true},
  rows: {type: [cell], required: true },
  createdAt: {type: Date, default: Date.now},
})

const Card = mongoose.model("Card", card);

const createSampleCard = async () => {
  try {
    const sampleCard = await Card.create({
      rows: [
        {
          id: "r1-cell-1",
          class: "cell",
          value: "green-car",
          row: 1,
          column: 1,
          bDiagonal: true,
          fDiagonal: false,
          corner: true,
        },
      ]
    });
    if (sampleCard){
      console.log("Created card:", JSON.stringify(sampleCard));
      
      sampleCard.rows[0].set("value", "final-update");
      await sampleCard.save();
      
      console.log("Updated cell [value] in card:", JSON.stringify(sampleCard.rows[0].get("value")));
    }
  } catch (e) {
    console.error("Error creating card:", e);
  }
}

// createSampleCard();

function rowColumnValidate(value: number) {
  return 0 < value && value <= 5;
}

