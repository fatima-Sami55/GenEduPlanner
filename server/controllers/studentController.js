const Joi = require('joi');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const storageService = require('../services/storageService');

const profileSchema = Joi.object({
    id: Joi.string().required(), // Simple ID from client for now
    name: Joi.string().optional(),
    age: Joi.number().optional(),
    currentEducation: Joi.string().optional(),
    gpa: Joi.number().min(0).max(4.0).optional(),
    intended_major: Joi.string().required(),
    career_goal: Joi.string().required(),
    country_preference: Joi.string().required(),
    budget_range: Joi.string().required(),
    english_proficiency: Joi.string().valid('Native', 'Advanced', 'Intermediate', 'Beginner').required(),
    interests: Joi.array().items(Joi.string()).required(),
    risk_tolerance: Joi.string().valid('Low', 'Medium', 'High').required(),
    academic_strengths: Joi.array().items(Joi.string()),
    academic_weaknesses: Joi.array().items(Joi.string()),
    dynamic_answers: Joi.array().items(Joi.any()).optional(),
    additional_info: Joi.string().optional().allow(''),

    // Flow control flags (initialized by server usually, but allowing client to send if needed for recovery, though typically server overrides)
    questions_completed: Joi.boolean().default(false),
    report_generated: Joi.boolean().default(false),
    question_count: Joi.number().default(0)
});

exports.createProfile = catchAsync(async (req, res, next) => {
    const { error, value } = profileSchema.validate(req.body);

    if (error) {
        return next(new AppError(`Validation Error: ${error.details.map(x => x.message).join(', ')}`, 400));
    }

    const profileData = {
        ...value,
        questions_completed: false,
        report_generated: false,
        question_count: 0
    };

    const profile = storageService.saveProfile(value.id, profileData);

    res.status(201).json({
        status: 'success',
        data: {
            profile
        }
    });
});

exports.getProfile = catchAsync(async (req, res, next) => {
    const profile = storageService.getProfile(req.params.id);

    if (!profile) {
        return next(new AppError('No profile found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            profile
        }
    });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;

    // Simple check if profile exists
    const existingProfile = storageService.getProfile(id);
    if (!existingProfile) {
        return next(new AppError('No profile found with that ID', 404));
    }

    // Merge updates (no strict schema validation for partial updates for flexibility here)
    // In production, we'd use a separate Joi schema for updates.
    const updatedProfile = storageService.saveProfile(id, updates);

    res.status(200).json({
        status: 'success',
        data: {
            profile: updatedProfile
        }
    });
});
