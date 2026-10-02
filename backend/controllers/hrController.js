const hrService = require('../services/hrService');
const { successResponse } = require('../utils/response');

const getCases = async (req, res, next) => {
  try {
    const cases = await hrService.getHRCases(req.user, req.query);
    return successResponse(res, cases, 'HR cases retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getCaseById = async (req, res, next) => {
  try {
    const caseData = await hrService.getHRCaseById(req.user, req.params.id);
    return successResponse(res, caseData, 'HR case details retrieved');
  } catch (err) {
    next(err);
  }
};

const updateCase = async (req, res, next) => {
  try {
    const updated = await hrService.updateHRCase(req.user, req.params.id, req.body);
    return successResponse(res, updated, 'HR case status updated successfully');
  } catch (err) {
    next(err);
  }
};

const addCaseNote = async (req, res, next) => {
  try {
    const note = await hrService.addHRCaseNote(req.user, req.params.id, req.body.note_text);
    return successResponse(res, note, 'Internal case note recorded successfully', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCases,
  getCaseById,
  updateCase,
  addCaseNote,
};
