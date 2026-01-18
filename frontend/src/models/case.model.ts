// 案件状态
export type CaseStatus = 
  | 'INVESTIGATION'            // 侦查中
  | 'PROCURATORATE'              // 检察院起诉
  | 'COURT_TRIAL'             // 法院审理
  | 'CLOSED';                 // 结案

// 案件类型
export type CaseType = 
  | 'PUBLIC_PROSECUTION' // 公诉
  | 'CIVIL_LITIGATION'; // 民事诉讼
  
// 案件接口
export interface Case {
  _id: string;
  caseNumber: string;
  caseTitle: string;
  caseType: CaseType;
  description?: string;
  status: CaseStatus;
  prosecutorIds?: string[];           // 公诉案件 - 检察官ID数组
  plaintiffLawyerIds?: string[];      // 民事诉讼 - 原告律师ID数组
  defendantLawyerIds?: string[];      // 通用 - 被告律师ID数组
  policeId?: string;
  judgeId?: string;                   // 单个法官ID（注意：后端模型中是单个）
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseDTO {
  caseNumber: string;
  caseTitle: string;
  caseType: CaseType;
  description?: string;
  plaintiffMessage?: string;
  defendantMessage?: string;
  prosecutorIds?: string[];           // 公诉案件 - 检察官ID
  judgeIds?: string[];                // 通用 - 法官ID（后端接口期望数组，但模型是单个，可能取第一个）
  plaintiffLawyerIds?: string[];      // 民事诉讼 - 原告律师ID
  defendantLawyerIds?: string[];      // 通用 - 被告律师ID
  lawyerIds?: string[];               // 公诉案件 - 律师ID（通用，可能映射到 defendantLawyerIds）
}

export interface UpdateCaseDTO {
  caseTitle?: string;
  caseType?: CaseType;
  description?: string;
  plaintiffMessage?: string;
  defendantMessage?: string;
  prosecutorIds?: string[];
  judgeIds?: string[];
  plaintiffLawyerIds?: string[];
  defendantLawyerIds?: string[];
}

export interface MoveNextStageDTO {
  targetStatus?: CaseStatus;
  comment?: string;
  operatorAddress?: string;
}