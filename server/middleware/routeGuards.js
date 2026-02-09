const AppError = require('../utils/appError');
const storageService = require('../services/storageService');

exports.checkQuestionsCompleted = (req, res, next) => {
    // Expecting studentId in body (for POST) or params (for GET)
    const studentId = req.body.studentId || req.params.id;

    if (!studentId) {
        return next(new AppError('Student ID required', 400));
    }

    const profile = storageService.getProfile(studentId);

    if (!profile) {
        return next(new AppError('Profile not found', 404));
    }

    if (!profile.questions_completed && profile.question_count < 4) {
        // Fallback: if user manually tries to skip, we block.
        // Note: Logic allows checking if they are *supposed* to be done.
        // If called on a route that requires completion, we error.
        return next(new AppError('You must complete the questionnaire first.', 403));
    }

    next();
};

exports.checkReportGenerated = (req, res, next) => {
    const studentId = req.body.studentId || req.params.id;

    if (!studentId) {
        return next(new AppError('Student ID required', 400));
    }

    const profile = storageService.getProfile(studentId);

    if (!profile) {
        return next(new AppError('Profile not found', 404));
    }

    if (!profile.report_generated) {
        return next(new AppError('Final report has not been generated yet.', 403));
    }

    next();
};
