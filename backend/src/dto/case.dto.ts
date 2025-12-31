import mongoose, { Document } from "mongoose";
import { CaseType, CaseStatus } from "../models/case.model"

// ========== 调整 DTO 接口：拆分律师ID字段 ==========
export interface AddCaseBody {
    caseNumber: string;
    caseTitle: string;
    caseType: CaseType;
    description?: string;
    plaintiffMessage?: string;
    defendantMessage?: string;
    prosecutorIds?: string[];       // 公诉案件 - 检察官ID
    judgeIds?: string[];            // 通用 - 法官ID
    plaintiffLawyerIds?: string[];  // 民事诉讼 - 原告律师ID
    defendantLawyerIds?: string[];  // 民事诉讼 - 被告律师ID
    lawyerIds?: string[];           // 公诉案件 - 律师ID（通用）
}

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

