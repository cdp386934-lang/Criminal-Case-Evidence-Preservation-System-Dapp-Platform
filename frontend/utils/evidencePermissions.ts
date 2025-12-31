/**
 * 证据权限检查工具函数
 * 根据后端权限逻辑，检查用户对证据的操作权限
 */

import { CaseStatus, Evidence } from '@/types/models'
import { User } from '@/store/authStore'

const getUserId = (user?: User | null) => user?._id || user?.id || ''

const POLICE_UPLOADABLE = new Set<CaseStatus>(['FILED', 'INVESTIGATION'])
const POLICE_VIEWABLE = new Set<CaseStatus>(['FILED', 'INVESTIGATION', 'TRANSFER_TO_PROCURATORATE'])

const PROSECUTOR_UPLOADABLE = new Set<CaseStatus>([
  'TRANSFER_TO_PROCURATORATE',
  'PROCURATORATE_REVIEW',
  'PROSECUTION',
  'COURT_TRIAL',
])
const PROSECUTOR_VIEWABLE = new Set<CaseStatus>([
  'TRANSFER_TO_PROCURATORATE',
  'PROCURATORATE_REVIEW',
  'PROSECUTION',
  'COURT_TRIAL',
  'JUDGEMENT',
  'CLOSED',
])

const JUDGE_UPLOADABLE = new Set<CaseStatus>(['COURT_TRIAL'])
const JUDGE_VIEWABLE = new Set<CaseStatus>(['PROSECUTION', 'COURT_TRIAL', 'JUDGEMENT', 'CLOSED'])

const LAWYER_UPLOADABLE = new Set<CaseStatus>(['COURT_TRIAL'])
const LAWYER_VIEWABLE = new Set<CaseStatus>(['COURT_TRIAL', 'JUDGEMENT', 'CLOSED'])

const IMMUTABLE_STATUSES = new Set<CaseStatus>(['JUDGEMENT', 'CLOSED'])

/**
 * 检查用户是否可以上传证据
 * 需要传入案件状态以匹配后端限制
 */
export function canUploadEvidence(user: User | null, caseStatus?: CaseStatus): boolean {
  if (!user || !caseStatus) return false

  if (user.role === 'police') return POLICE_UPLOADABLE.has(caseStatus)
  if (user.role === 'prosecutor') return PROSECUTOR_UPLOADABLE.has(caseStatus)
  if (user.role === 'judge') return JUDGE_UPLOADABLE.has(caseStatus)
  if (user.role === 'lawyer') return LAWYER_UPLOADABLE.has(caseStatus)

  return false
}

/**
 * 检查用户是否可以编辑证据
 * 只有上传者可以编辑自己上传的证据；法官不能编辑
 */
export function canEditEvidence(evidence: Evidence, user: User | null, caseStatus?: CaseStatus): boolean {
  if (!user || !caseStatus) return false
  if (IMMUTABLE_STATUSES.has(caseStatus)) return false

  // 法官不能编辑证据
  if (user.role === 'judge') return false

  // 检查是否是证据的上传者
  const uploaderId = typeof evidence.uploaderId === 'object' 
    ? evidence.uploaderId._id || evidence.uploaderId.toString()
    : evidence.uploaderId.toString()
  
  if (uploaderId !== getUserId(user)) return false

  if (user.role === 'police') return POLICE_UPLOADABLE.has(caseStatus)
  if (user.role === 'prosecutor') return PROSECUTOR_UPLOADABLE.has(caseStatus)
  if (user.role === 'lawyer') return LAWYER_UPLOADABLE.has(caseStatus)

  return false
}

/**
 * 检查用户是否可以删除证据
 * 只有上传者可以删除自己上传的证据；法官不能删除
 */
export function canDeleteEvidence(evidence: Evidence, user: User | null, caseStatus?: CaseStatus): boolean {
  if (!user || !caseStatus) return false
  if (IMMUTABLE_STATUSES.has(caseStatus)) return false

  // 法官不能删除证据
  if (user.role === 'judge') return false

  // 检查是否是证据的上传者
  const uploaderId = typeof evidence.uploaderId === 'object' 
    ? evidence.uploaderId._id || evidence.uploaderId.toString()
    : evidence.uploaderId.toString()
  
  if (uploaderId !== getUserId(user)) return false

  if (user.role === 'police') return POLICE_UPLOADABLE.has(caseStatus)
  if (user.role === 'prosecutor') return PROSECUTOR_UPLOADABLE.has(caseStatus)
  if (user.role === 'lawyer') return LAWYER_UPLOADABLE.has(caseStatus)

  return false
}

/**
 * 检查用户是否可以查看证据
 * 需要传入案件状态保证阶段限制
 */
export function canViewEvidence(user: User | null, caseStatus?: CaseStatus): boolean {
  if (!user || !caseStatus) return false

  if (user.role === 'police') return POLICE_VIEWABLE.has(caseStatus)
  if (user.role === 'prosecutor') return PROSECUTOR_VIEWABLE.has(caseStatus)
  if (user.role === 'judge') return JUDGE_VIEWABLE.has(caseStatus)
  if (user.role === 'lawyer') return LAWYER_VIEWABLE.has(caseStatus)

  return false
}

