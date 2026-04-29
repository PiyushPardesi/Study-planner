import Schedule from '../models/Schedule.js';

// @desc    Add a new event/schedule
export const createSchedule = async (req, res) => {
  try {
    const { title, description, startTime, endTime, category } = req.body;
    
    const schedule = await Schedule.create({
      user: req.user._id,
      title,
      description,
      startTime,
      endTime,
      category
    });

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all schedules for the logged-in user
export const getMySchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ user: req.user._id })
      .sort({ startTime: 1 }); // Sort by earliest time first
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a schedule (including description)
export const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule || schedule.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule || schedule.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    await schedule.deleteOne();
    res.json({ message: "Schedule deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};