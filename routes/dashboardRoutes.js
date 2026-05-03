const express = require("express");
const Task    = require("../models/Task");
const Project = require("../models/Project");
const auth    = require("../middleware/auth");
const router  = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === "Admin";
    const taskFilter    = isAdmin ? {} : { assignedTo: req.user.id };
    const projectFilter = isAdmin ? {} : { members: req.user.id };

    const tasks    = await Task.find(taskFilter);
    const projects = await Project.find(projectFilter);
    const now      = new Date();

    res.json({
      totalTasks:     tasks.length,
      completed:      tasks.filter(t => t.status === "Completed").length,
      inProgress:     tasks.filter(t => t.status === "In Progress").length,
      pending:        tasks.filter(t => t.status === "Pending").length,
      overdue:        tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== "Completed").length,
      totalProjects:  projects.length,
    });
  } catch { res.status(500).json({ msg: "Server error" }); }
});

module.exports = router;