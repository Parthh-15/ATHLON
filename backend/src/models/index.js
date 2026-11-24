import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  targets: {
    calories: { type: Number, default: 2200 },
    protein: { type: Number, default: 120 },
    water: { type: Number, default: 2500 }
  }
}, { timestamps: true });

const owned = { user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true } };
const workoutSchema = new Schema({
  ...owned, title: { type: String, required: true, trim: true },
  day: { type: String, required: true },
  focus: { type: String, default: "" },
  exercises: [{ name: String, sets: Number, reps: String, rest: String }]
}, { timestamps: true });

const mealSchema = new Schema({
  ...owned, name: { type: String, required: true, trim: true },
  category: { type: String, enum: ["Breakfast","Lunch","Snack","Dinner","Other"], default: "Other" },
  date: { type: String, required: true, index: true },
  time: { type: String, default: "" },
  calories: { type: Number, min: 0, default: 0 },
  protein: { type: Number, min: 0, default: 0 },
  carbs: { type: Number, min: 0, default: 0 },
  fats: { type: Number, min: 0, default: 0 }
}, { timestamps: true });

const waterSchema = new Schema({
  ...owned, date: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 1, max: 10000 },
  time: { type: String, default: "" }
}, { timestamps: true });

const sleepSchema = new Schema({
  ...owned, date: { type: String, required: true, index: true },
  bedtime: String, wakeTime: String, hours: { type: Number, min: 0, max: 24, required: true },
  quality: { type: String, enum: ["Great","Good","Okay","Poor"], default: "Good" }
}, { timestamps: true });

const routineSchema = new Schema({
  ...owned, title: { type: String, required: true, trim: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 30 },
  category: { type: String, enum: ["Morning","Work","Study","Gym","Meal","Rest","Other"], default: "Other" },
  date: { type: String, required: true, index: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const progressSchema = new Schema({
  ...owned, date: { type: String, required: true, index: true },
  weight: { type: Number, required: true, min: 1, max: 500 },
  notes: { type: String, default: "" }
}, { timestamps: true });

export const User = model("User", userSchema);
export const Workout = model("Workout", workoutSchema);
export const Meal = model("Meal", mealSchema);
export const Water = model("Water", waterSchema);
export const Sleep = model("Sleep", sleepSchema);
export const Routine = model("Routine", routineSchema);
export const Progress = model("Progress", progressSchema);
