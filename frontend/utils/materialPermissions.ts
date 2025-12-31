import { CaseStatus, DefenseMaterial } from '@/types/models'
import { User } from '@/store/authStore'

const getUserId = (user?: User | null) => user?._id || user?.id || ''

const MATERIAL_UPLOADABLE = new Set<CaseStatus>(['COURT_TRIAL'])
const LAWYER_VIEWABLE = new Set<CaseStatus>(['COURT_TRIAL', 'JUDGEMENT', 'CLOSED'])

export function canUploadMaterial(user: User | null, caseStatus?: CaseStatus) {
  return !!user && user.role === 'lawyer' && !!caseStatus && MATERIAL_UPLOADABLE.has(caseStatus)
}

export function canEditMaterial(
  material: DefenseMaterial,
  user: User | null,
  caseStatus?: CaseStatus
) {
  if (!canUploadMaterial(user, caseStatus)) return false
  const uploaderId =
    typeof material.lawyerId === 'object'
      ? (material.lawyerId as any)._id || material.lawyerId.toString()
      : material.lawyerId?.toString()
  return uploaderId === getUserId(user)
}

export function canDeleteMaterial(
  material: DefenseMaterial,
  user: User | null,
  caseStatus?: CaseStatus
) {
  return canEditMaterial(material, user, caseStatus)
}

export function canViewMaterial(user: User | null, caseStatus?: CaseStatus) {
  if (!user || !caseStatus) return false
  if (user.role === 'lawyer') return LAWYER_VIEWABLE.has(caseStatus)
  if (user.role === 'judge' || user.role === 'prosecutor') return true
  return false
}

