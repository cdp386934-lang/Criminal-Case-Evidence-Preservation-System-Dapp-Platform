/**
 * 案件权限检查工具函数
 * 根据后端权限逻辑，检查用户对案件的操作权限
 */


import { CaseStatus } from '@/src/models/case.model'
import { UserRole } from '@/src/models/user.model'
import { User } from '@/store/authStore'

const getUserId = (user?: User | null) => user?._id || user?.id || ''

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  INVESTIGATION: '侦查中',
  PROCURATORATE:  '检察院起诉',
  COURT_TRIAL: '法院庭审',
  CLOSED: '结案',
}

export const CASE_WORKFLOW_ORDER: CaseStatus[] = [
  'INVESTIGATION',
  'PROCURATORATE',
  'COURT_TRIAL',
  'CLOSED',
]

// 与后端 caseWorkflowService 的 WORKFLOW_TRANSITIONS 保持一致
export const CASE_WORKFLOW_TRANSITIONS: Record<CaseStatus, Partial<Record<UserRole, CaseStatus[]>>> = {
  INVESTIGATION: {
    police: ['PROCURATORATE'],
  },
  PROCURATORATE: {
    prosecutor: ['COURT_TRIAL'],
  },
  COURT_TRIAL: {
    judge: ['CLOSED'], // 可以起诉或退回补充侦查
  },
  CLOSED: {},
}

const JUDGE_VIEWABLE = new Set<CaseStatus>(['PROSECUTION', 'COURT_TRIAL', 'JUDGEMENT', 'CLOSED'])
const LAWYER_VIEWABLE = new Set<CaseStatus>(['COURT_TRIAL', 'JUDGEMENT', 'CLOSED'])
const POLICE_VIEWABLE = new Set<CaseStatus>(['FILED', 'INVESTIGATION', 'TRANSFER_TO_PROCURATORATE'])

/**
 * 检查用户是否是案件的参与者
 * 参与者包括：案件的检察官、被分配的法官、被分配的律师
 */
export function isCaseParticipant(caseData: Case, userId: string): boolean {
  const normalized = userId?.toString()
  if (!normalized) return false

  if (
    caseData.policeId === normalized ||
    (typeof caseData.policeId === 'object' && (caseData.policeId as any)._id === normalized)
  ) {
    return true
  }

  if (
    caseData.prosecutorId === normalized ||
    (typeof caseData.prosecutorId === 'object' && (caseData.prosecutorId as any)._id === normalized)
  ) {
    return true
  }

  const judgeIds = caseData.judgeIds || []
  if (
    judgeIds.some((judgeId: any) => {
      const id = typeof judgeId === 'object' ? judgeId._id || judgeId.toString() : judgeId.toString()
      return id === normalized
    })
  ) {
    return true
  }

  const lawyerIds = caseData.lawyerIds || []
  if (
    lawyerIds.some((lawyerId: any) => {
      const id = typeof lawyerId === 'object' ? lawyerId._id || lawyerId.toString() : lawyerId.toString()
      return id === normalized
    })
  ) {
    return true
  }

  return false
}

/**
 * 检查用户是否可以编辑案件
 * 只有被分配到此案件的法官可以编辑
 */
export function canEditCase(caseData: Case, user: User | null): boolean {
  if (!user || user.role !== 'judge') {
    return false
  }

  // 检查是否是被分配的法官
  const judgeIds = caseData.judgeIds || []
  return judgeIds.some((judgeId: any) => {
    const id = typeof judgeId === 'object' ? judgeId._id || judgeId.toString() : judgeId.toString()
    return id === getUserId(user)
  })
}

/**
 * 检查用户是否可以删除案件
 * 只有被分配到此案件的法官可以删除
 */
export function canDeleteCase(caseData: Case, user: User | null): boolean {
  if (!user || user.role !== 'judge') {
    return false
  }

  // 检查是否是被分配的法官
  const judgeIds = caseData.judgeIds || []
  return judgeIds.some((judgeId: any) => {
    const id = typeof judgeId === 'object' ? judgeId._id || judgeId.toString() : judgeId.toString()
    return id === getUserId(user)
  })
}

/**
 * 检查用户是否可以创建案件
 * 只有公安可以创建案件（立案）
 */
export function canCreateCase(user: User | null): boolean {
  return user?.role === 'police'
}

/**
 * 检查用户是否可以查看案件
 * 公安、检察官、法官、律师都可以查看，但只能查看自己被分配的案件，并满足阶段限制
 */
export function canViewCase(caseData: Case, user: User | null): boolean {
  if (!user) {
    return false
  }

  const participant = isCaseParticipant(caseData, getUserId(user))
  if (!participant) return false

  if (user.role === 'judge') {
    return JUDGE_VIEWABLE.has(caseData.status)
  }

  if (user.role === 'lawyer') {
    return LAWYER_VIEWABLE.has(caseData.status)
  }

  if (user.role === 'police') {
    return POLICE_VIEWABLE.has(caseData.status)
  }

  return true
}

/**
 * 获取当前角色允许推进到的下一个状态列表
 */
export function getAllowedNextStages(caseData: Case, user: User | null): CaseStatus[] {
  if (!user) return []
  if (!isCaseParticipant(caseData, getUserId(user))) return []

  const transitions = CASE_WORKFLOW_TRANSITIONS[caseData.status]
  if (!transitions) return []

  return transitions[user.role] || []
}

/**
 * 是否可以推进案件
 */
export function canAdvanceCase(caseData: Case, user: User | null): boolean {
  return getAllowedNextStages(caseData, user).length > 0
}

