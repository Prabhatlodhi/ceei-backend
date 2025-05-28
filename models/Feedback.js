const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
	{
		feedback: {
			type: String,
			required: [true, "Feedback text is required"],
			trim: true,
			minlength: [10, "Feedback must be at least 10 characters long"],
			maxlength: [1000, "Feedback cannot exceed 1000 characters"],
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			enum: {
				values: ["Work Environment", "Leadership", "Growth", "Others"],
				message: "Category must be one of: Work Environment, Leadership, Growth, Others",
			},
		},
		isReviewed: {
			type: Boolean,
			default: false,
		},
		submissionTime: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true, // This adds createdAt and updatedAt fields
	}
);

// Index for better query performance
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ submissionTime: -1 });
feedbackSchema.index({ isReviewed: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
