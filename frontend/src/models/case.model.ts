// 案件状态
export type CaseStatus = 
  | 'INVESTIGATION'            // 侦查中
  | 'PROCURATORATE'              // 检察院起诉
  | 'COURT_TRIAL'             // 法院审理
  | 'CLOSED';                 // 结案

// 案件接口
export interface Case {
  _id: string;
  caseNumber: string;
  caseTitle: string;
  caseType: string;
  description?: string;
  status: CaseStatus;
  prosecutorId?: string;
  policeId?: string;
  judgeIds: string[];
  lawyerIds: string[];
  createdAt: string;
  updatedAt: string;
}


export interface CreateCaseDTO {
  caseNumber: string;
  caseTitle: string;
  caseType: string;
  description?: string;
  prosecutorIds?: string[];
  judgeIds?: string[];
  lawyerIds?: string[];
}

export interface UpdateCaseDTO {
  caseTitle?: string;
  caseType?: string;
  description?: string;
  judgeIds?: string[];
  lawyerIds?: string[];
}

export interface MoveNextStageDTO {
  targetStatus?: CaseStatus;
  comment?: string;
  operatorAddress?: string;
}