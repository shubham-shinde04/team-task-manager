const express = require("express");
const Task    = require("../models/Task");
const auth    = require("../middleware/auth");
const admin   = require("../middleware/admin");
const router  = express.Router();

// GET tasks
router.get("/", auth, async (req, res) => {
  try {
    const filter = req.user.role === "Admin"
      ? {}
      : { assignedTo: req.user.id };
    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("project", "name");
    res.json(tasks);
  } catch { res.status(500).json({ msg: "Server error" }); }
});

// POST create task — Admin only
router.post("/", auth, admin, async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate } = req.body;
    if (!title || !project) return res.status(400).json({ msg: "Title and project required" });
    const task = await Task.create({ title, description, project, assignedTo, dueDate });
    res.status(201).json(task);
  } catch { res.status(500).json({ msg: "Server error" }); }
});

// PATCH update status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "In Progress", "Completed"];
    if (!allowed.includes(status)) return res.status(400).json({ msg: "Invalid status" });
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(task);
  } catch { res.status(500).json({ msg: "Server error" }); }
});

// DELETE — Admin only
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: "Task deleted" });
  } catch { res.status(500).json({ msg: "Server error" }); }
});

module.exports = router;