const geminiClient = require('../geminiClient');
const prompts = require('../promptTemplates');
const storageService = require('../services/storageService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Helper to get profile or throw error
const getProfileOrError = (id) => {
    const profile = storageService.getProfile(id);
    if (!profile) {
        throw new AppError('Profile not found', 404);
    }
    return profile;
};

exports.getNextQuestion = catchAsync(async (req, res, next) => {
    const { studentId, answer } = req.body; // Expect answer to previous question if any
    if (!studentId) return next(new AppError('studentId is required', 400));

    const profile = getProfileOrError(studentId);

    // Update with previous answer if provided (mock logic as we don't have full history storage in profileSchema yet, 
    // but in memory 'profiles' object is flexible)
    if (answer) {
        if (!profile.answers) profile.answers = [];
        profile.answers.push(answer);
        storageService.saveProfile(studentId, { answers: profile.answers });
    }

    // Check if we reached the limit
    if (profile.question_count >= 4) {
        // Mark as completed just in case
        storageService.saveProfile(studentId, { questions_completed: true });

        return res.status(200).json({
            status: 'success',
            data: {
                completed: true,
                message: "Questionnaire completed. Proceed to recommendations."
            }
        });
    }

    // Increment count for the *next* question we are about to ask
    // (Or we can increment after answer? Logic: Requesting next question implies we are moving forward)
    // Let's increment AFTER generating to be safe, or simply count how many called.
    // Better: Helper increments.

    // Actually, prompts.generateStudentAnalysisPrompt uses the profile. 
    // If we want to ask a NEW question, we generate it.

    const prompt = prompts.generateStudentAnalysisPrompt(profile);
    const aiResponse = await geminiClient.generateContent(prompt);

    // Update count
    storageService.saveProfile(studentId, { question_count: (profile.question_count || 0) + 1 });

    res.status(200).json({
        status: 'success',
        data: aiResponse // { question: "...", reason: "..." }
    });
});

exports.getRecommendations = catchAsync(async (req, res, next) => {
    const { studentId } = req.body;
    if (!studentId) return next(new AppError('studentId is required', 400));

    const profile = getProfileOrError(studentId);

    // Flow control: Ensure questions are completion or count is sufficient
    // (Optional: enforce explicit check, but we set it here to be sure)

    const prompt = prompts.generateRecommendationPrompt(profile);
    const aiResponse = await geminiClient.generateContent(prompt);

    // Check for valid response structure (basic check)
    if (!aiResponse.recommendations) {
        throw new AppError("AI failed to generate recommendations. Please try again.", 500);
    }

    // Save state
    storageService.saveProfile(studentId, {
        lastRecommendations: aiResponse.recommendations,
        questions_completed: true
    });

    res.status(200).json({
        status: 'success',
        data: aiResponse
    });
});

exports.getRoadmap = catchAsync(async (req, res, next) => {
    const { studentId } = req.body;
    if (!studentId) return next(new AppError('studentId is required', 400));

    const profile = getProfileOrError(studentId);

    // Use stored recommendations or require them in body
    const recommendations = profile.lastRecommendations || req.body.recommendations;

    if (!recommendations || recommendations.length === 0) {
        return next(new AppError('No recommendations found. Generate recommendations first.', 400));
    }

    const prompt = prompts.generateRoadmapPrompt(profile, recommendations);
    const aiResponse = await geminiClient.generateContent(prompt);

    // Save report generated flag
    storageService.saveProfile(studentId, { report_generated: true });

    res.status(200).json({
        status: 'success',
        data: aiResponse
    });
});
