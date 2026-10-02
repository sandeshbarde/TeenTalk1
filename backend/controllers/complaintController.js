const fs = require('fs');
const complaintService = require('../services/complaintService');
const { verifyEvidenceAccess, decryptEvidenceFile } = require('../services/storageService');
const { successResponse, errorResponse } = require('../utils/response');

const fileComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.fileComplaint(req.user || null, req.body);
    return successResponse(
      res,
      complaint,
      'Complaint filed successfully. Please store your tracking code safely.',
      201
    );
  } catch (err) {
    next(err);
  }
};

const uploadEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No evidence file uploaded', 400, 'FILE_MISSING');
    }

    const complaintId = req.body.complaint_id || req.params.id;
    if (!complaintId) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        await fs.promises.unlink(req.file.path).catch(() => {});
      }
      return errorResponse(res, 'complaint_id is required to associate evidence', 400, 'COMPLAINT_ID_MISSING');
    }

    const evidence = await complaintService.uploadEvidence(
      req.user || null,
      complaintId,
      req.body.tracking_code,
      req.file
    );
    return successResponse(res, evidence, 'Evidence securely uploaded and attached', 201);
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }
    next(err);
  }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const list = await complaintService.getMyComplaints(req.user);
    return successResponse(res, list, 'My complaints retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(req.user || null, req.params.id);
    return successResponse(res, complaint, 'Complaint details retrieved');
  } catch (err) {
    next(err);
  }
};

const downloadEvidence = async (req, res, next) => {
  try {
    const evidenceId = req.params.evidenceId;
    const { evidence } = verifyEvidenceAccess(req.user, evidenceId);

    if (!fs.existsSync(evidence.file_path)) {
      return errorResponse(res, 'Physical evidence file not found on disk', 404, 'FILE_NOT_FOUND');
    }

    const contents = await decryptEvidenceFile(evidence);
    res.setHeader('Content-Type', evidence.file_type);
    res.setHeader('Content-Length', contents.length);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(evidence.file_name)}`);
    return res.send(contents);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  fileComplaint,
  uploadEvidence,
  getMyComplaints,
  getComplaintById,
  downloadEvidence,
};
