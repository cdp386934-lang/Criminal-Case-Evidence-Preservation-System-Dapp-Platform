import mongoose from "mongoose";
import { CreateCaseDTO, UpdateCaseDTO } from "../dto/case.dto";
import Case, { CaseStatus, ICase } from "../models/case.model";
import { NotFoundError } from "../utils/errors";

export const createCase = async (payload: CreateCaseDTO & { policeId?: string }): Promise<ICase> => {
    const caseData: any = {
        caseNumber: payload.caseNumber,
        caseTitle: payload.caseTitle,
        caseType: payload.caseType,
        description: payload.description,
        plaintiffMessage: payload.plaintiffMessage,
        defendantMessage: payload.defendantMessage,
        status: payload.status || CaseStatus.INVESTIGATION,
    };

    if (payload.policeId) {
        caseData.policeId = new mongoose.Types.ObjectId(payload.policeId);
    }

    if (payload.prosecutorIds && payload.prosecutorIds.length > 0) {
        caseData.prosecutorIds = payload.prosecutorIds.map(id => new mongoose.Types.ObjectId(id));
    }

    if (payload.judgeIds && payload.judgeIds.length > 0) {
        caseData.judgeIds = payload.judgeIds.map(id => new mongoose.Types.ObjectId(id));
    }

    if (payload.lawyerIds && payload.lawyerIds.length > 0) {
        caseData.lawyerIds = payload.lawyerIds.map(id => new mongoose.Types.ObjectId(id));
    }

    const newCase = new Case(caseData);
    return newCase.save();
};

export const updateCaseInternal = async (caseId: string, updates: UpdateCaseDTO): Promise<ICase> => {
    const updateData: any = {};

    if (updates.caseTitle) updateData.caseTitle = updates.caseTitle;
    if (updates.caseType) updateData.caseType = updates.caseType;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status) updateData.status = updates.status;

    if (updates.judgeIds) {
        updateData.judgeIds = updates.judgeIds.map(id => new mongoose.Types.ObjectId(id));
    }

    if (updates.lawyerIds) {
        updateData.lawyerIds = updates.lawyerIds.map(id => new mongoose.Types.ObjectId(id));
    }

    const updated = await Case.findByIdAndUpdate(caseId, updateData, { new: true });
    if (!updated) {
        throw new NotFoundError('Case not found');
    }
    return updated;
};

export const deleteCaseInternal = async (caseId: string): Promise<void> => {
    const deleted = await Case.findByIdAndDelete(caseId);
    if (!deleted) {
        throw new NotFoundError('Case not found');
    }
};

export const listCasesInternal = async (): Promise<ICase[]> => {
    return Case.find()
        .populate('policeId', 'name email role')
        .populate('prosecutorIds', 'name email role')
        .populate('judgeIds', 'name email role')
        .populate('lawyerIds', 'name email role')
        .sort({ createdAt: -1 });
};

export const getCaseById = async (caseId: string): Promise<ICase | null> => {
    return Case.findById(caseId);
};
