import mongoose, { Document } from "mongoose";
import { CaseType, CaseStatus } from "../models/case.model"
export interface CreateCaseDTO {
    caseNumber: string;
    caseTitle: string;
    caseType: CaseType;
    description?: string;
    plaintiffMessage?: string;
    defendantMessage?: string;
    prosecutorIds?: mongoose.Types.ObjectId[];
    judgeIds?: mongoose.Types.ObjectId[];
    plaintiffLawyerIds?: mongoose.Types.ObjectId[]; // 原告律师
    defendantLawyerIds?: mongoose.Types.ObjectId[]; // 被告律师
    lawyerIds?: mongoose.Types.ObjectId[];          // 公诉律师
    status?: CaseStatus;
}
export interface UpdateCaseDTO {
    caseTitle?: string;
    caseType?: CaseType;
    description?: string;
    judgeIds?: string[];
    lawyerIds?: string[];
    status?: CaseStatus;
}

