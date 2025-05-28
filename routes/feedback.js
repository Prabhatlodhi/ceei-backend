const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

router.get("/feedback", async (req, res) => {
	try {
		const { category, reviewed, page = 1, limit = 10, sort = "-submissionTime" } = req.query;

		const filter = {};

		if (category) {
			filter.category = category;
		}

		if (reviewed !== undefined) {
			filter.isReviewed = reviewed === "true";
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const feedback = await Feedback.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).lean();

		const total = await Feedback.countDocuments(filter);

		res.status(200).json({
			success: true,
			count: feedback.length,
			total,
			page: parseInt(page),
			pages: Math.ceil(total / parseInt(limit)),
			data: feedback,
		});
	} catch (error) {
		console.error("Error fetching feedback:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching feedback",
		});
	}
});

router.post("/feedback", async (req, res) => {
	try {
		const { feedback, category } = req.body;

		if (!feedback || !category) {
			return res.status(400).json({
				success: false,
				message: "Feedback and category are required",
			});
		}

		const newFeedback = new Feedback({
			feedback: feedback.trim(),
			category,
		});

		const savedFeedback = await newFeedback.save();

		res.status(201).json({
			success: true,
			message: "Feedback submitted successfully",
			data: savedFeedback,
		});
	} catch (error) {
		console.error("Error submitting feedback:", error);

		if (error.name === "ValidationError") {
			const errors = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				message: "Validation error",
				errors,
			});
		}

		res.status(500).json({
			success: false,
			message: "Server error while submitting feedback",
		});
	}
});

router.get("/feedback/:id", async (req, res) => {
	try {
		const feedback = await Feedback.findById(req.params.id);

		if (!feedback) {
			return res.status(404).json({
				success: false,
				message: "Feedback not found",
			});
		}

		res.status(200).json({
			success: true,
			data: feedback,
		});
	} catch (error) {
		console.error("Error fetching feedback:", error);

		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				message: "Invalid feedback ID",
			});
		}

		res.status(500).json({
			success: false,
			message: "Server error while fetching feedback",
		});
	}
});

router.patch("/feedback/:id/reviewed", async (req, res) => {
	try {
		const feedback = await Feedback.findByIdAndUpdate(
			req.params.id,
			{ isReviewed: true },
			{ new: true, runValidators: true }
		);

		if (!feedback) {
			return res.status(404).json({
				success: false,
				message: "Feedback not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Feedback marked as reviewed",
			data: feedback,
		});
	} catch (error) {
		console.error("Error updating feedback:", error);

		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				message: "Invalid feedback ID",
			});
		}

		res.status(500).json({
			success: false,
			message: "Server error while updating feedback",
		});
	}
});

router.delete("/feedback/:id", async (req, res) => {
	try {
		const feedback = await Feedback.findByIdAndDelete(req.params.id);

		if (!feedback) {
			return res.status(404).json({
				success: false,
				message: "Feedback not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting feedback:", error);

		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				message: "Invalid feedback ID",
			});
		}

		res.status(500).json({
			success: false,
			message: "Server error while deleting feedback",
		});
	}
});

module.exports = router;
