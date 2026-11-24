import { Router } from "express";
import { User, Workout, Meal, Water, Sleep, Routine, Progress } from "../models/index.js";
const router = Router();
const dayNow = () => new Date().toISOString().slice(0, 10);
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const owned = (req) => ({ user: req.userId });
const dateOf = (req) => req.query.date || req.body.date || dayNow();

router.get("/profile", asyncRoute(async (req,res) => {
  const u = await User.findById(req.userId).select("-password");
  res.json({ user: u });
}));
router.put("/profile/targets", asyncRoute(async (req,res) => {
  const { calories, protein, water } = req.body;
  const targets = {};
  for (const [k,v] of Object.entries({calories,protein,water})) if (v !== undefined) {
    const n = Number(v); if (!Number.isFinite(n) || n < 0 || n > 20000) return res.status(400).json({message:`Invalid ${k} target`});
    targets[`targets.${k}`] = n;
  }
  const user = await User.findByIdAndUpdate(req.userId, {$set:targets}, {new:true}).select("-password");
  res.json({ user });
}));

router.get("/dashboard", asyncRoute(async (req,res) => {
  const date = dateOf(req), user = await User.findById(req.userId).select("name targets");
  const [meals, waters, sleeps, routines, workouts] = await Promise.all([
    Meal.find({ ...owned(req), date }), Water.find({ ...owned(req), date }),
    Sleep.find({ ...owned(req), date }), Routine.find({ ...owned(req), date }),
    Workout.find(owned(req))
  ]);
  const totals = meals.reduce((a,m) => ({ calories:a.calories+m.calories, protein:a.protein+m.protein, carbs:a.carbs+m.carbs, fats:a.fats+m.fats }), {calories:0,protein:0,carbs:0,fats:0});
  const water = waters.reduce((s,w)=>s+w.amount,0);
  res.json({ date, user, totals, water, sleep:sleeps[0] || null, routines, workouts });
}));

const crud = (path, Model, sort = { createdAt: -1 }) => {
  router.get(`/${path}`, asyncRoute(async(req,res)=>res.json(await Model.find({...owned(req), ...(req.query.date ? {date:req.query.date}: {})}).sort(sort))));
  router.post(`/${path}`, asyncRoute(async(req,res)=>{
    const doc = await Model.create({...req.body, user:req.userId});
    res.status(201).json(doc);
  }));
  router.delete(`/${path}/:id`, asyncRoute(async(req,res)=>{
    const doc = await Model.findOneAndDelete({_id:req.params.id,user:req.userId});
    if(!doc) return res.status(404).json({message:"Record not found"});
    res.json({message:"Deleted"});
  }));
};
crud("meals", Meal);
crud("water", Water);
crud("sleep", Sleep);
crud("progress", Progress, {date:1});
crud("workouts", Workout, {createdAt:1});
crud("routines", Routine, {time:1});

router.put("/workouts/:id", asyncRoute(async(req,res)=>{
  const doc=await Workout.findOneAndUpdate({_id:req.params.id,user:req.userId},req.body,{new:true,runValidators:true});
  if(!doc) return res.status(404).json({message:"Workout not found"});
  res.json(doc);
}));
router.put("/routines/:id", asyncRoute(async(req,res)=>{
  const doc=await Routine.findOneAndUpdate({_id:req.params.id,user:req.userId},req.body,{new:true,runValidators:true});
  if(!doc) return res.status(404).json({message:"Routine not found"});
  res.json(doc);
}));
router.get("/analytics", asyncRoute(async(req,res)=>{
  const since = new Date(); since.setDate(since.getDate()-6);
  const start = since.toISOString().slice(0,10);
  const [meals, waters, progress, sleeps] = await Promise.all([
    Meal.find({...owned(req),date:{$gte:start}}), Water.find({...owned(req),date:{$gte:start}}),
    Progress.find(owned(req)).sort({date:1}).limit(90), Sleep.find({...owned(req),date:{$gte:start}})
  ]);
  const days = Array.from({length:7},(_,i)=>{const d=new Date(since);d.setDate(d.getDate()+i);return d.toISOString().slice(0,10);});
  const weekly = days.map(date=>({
    date, calories:meals.filter(m=>m.date===date).reduce((s,m)=>s+m.calories,0),
    protein:meals.filter(m=>m.date===date).reduce((s,m)=>s+m.protein,0),
    water:waters.filter(w=>w.date===date).reduce((s,w)=>s+w.amount,0),
    sleep:sleeps.filter(s=>s.date===date).reduce((v,s)=>v+s.hours,0)
  }));
  res.json({weekly, progress});
}));
export default router;
