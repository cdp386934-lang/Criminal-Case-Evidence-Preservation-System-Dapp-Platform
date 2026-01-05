import { AuthenticatedUserPayload } from "../middleware/auth";
import Case, { ICase } from "../models/case.model";
import { UserRole } from "../models/users.model";
import { ForbiddenError, NotFoundError } from "../utils/errors";


export const isCaseParticipant = (caseDoc: ICase, user: AuthenticatedUserPayload) => {
  const uid = user.userId;

  switch (user.role) {
    case UserRole.POLICE:
      return caseDoc.policeId?.toString() === uid;

    case UserRole.PROSECUTOR:
      return caseDoc.prosecutorIds?.some(id => id.toString() === uid) ?? false;

    case UserRole.JUDGE:
      return caseDoc.judgeId?.toString() === uid;

    case UserRole.LAWYER:
      return (
        caseDoc.plaintiffLawyerIds?.some(id => id.toString() === uid) ||
        caseDoc.defendantLawyerIds?.some(id => id.toString() === uid)
      );

    default:
      return false;
  }
};

export const loadAndCheckCase = async (
  caseId: string,
  user?: AuthenticatedUserPayload,
) => {
  if (!user) throw new ForbiddenError('Authentication required');

  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new NotFoundError('Case not found');

  if (!isCaseParticipant(caseDoc, user)) {
    throw new ForbiddenError('You are not assigned to this case');
  }

  return caseDoc;
};
