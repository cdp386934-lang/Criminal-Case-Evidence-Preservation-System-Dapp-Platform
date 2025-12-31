// 质证意见状态
export type ObjectionStatus = 'pending' | 'accepted' | 'rejected';

// 质证意见接口
export interface Objection {
  _id: string;
  objectionId: string;
  caseId: string | {
    _id: string;
    caseNumber: string;
    caseTitle: string;
  };
  evidenceId: string | {
    _id: string;
    evidenceId: string;
    title: string;
    fileHash?: string;
  };
  lawyerId: string | {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  status: ObjectionStatus;
  handledBy?: string | {
    _id: string;
    name: string;
    email: string;
  };
  handledAt?: string;
  handleResult?: string;
  isAccepted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateObjectionDTO {
  caseId: string;
  evidenceId: string;
  content: string;
}

export interface HandleObjectionDTO {
  isAccepted: boolean;
  handleResult: string;
}