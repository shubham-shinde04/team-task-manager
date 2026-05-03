const express = require("express");
const Project = require("../models/Project");
const auth    = require("../middleware/auth");
const admin   = require("../middleware/admin");
const router  = express.Router();

// GET all projects
router.get("/", auth, async (req, res) => {
  try {
    const filter = req.user.role === "Admin"
      ? {}
      : { members: req.user.id };
    const projects = await Project.find(filter)
      .populate("createdBy", "name email")
      .populate("members", "name email");
    res.json(projects);
  } catch { res.status(500).json({ msg: "Server error" }); }
});

// POST create project — Admin only
router.post("/", auth, admin, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name) return res.status(400).json({ msg: "Project name required" });
    const project = await Project.create({
      name, description,
      createdBy: req.user.id,
      members: members || []
    });
    res.status(201).json(project);
  } catch { res.status(500).json({ msg: "Server error" }); }
});

// GET single project
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email");
    if (!project) return res.status(404).json({ msg: "Not found" });
    res.json(project);
  } catch { res.status(500).json({ msg: "Server error" }); }
});

// PUT update — Admin only
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch { res.status(500).json({ msg: "Server error" }); }
});

// DELETE — Admin only
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ msg: "Project deleted" });
  } catch { res.status(500).json({ msg: "Server error" }); }
});

module.exports = router;