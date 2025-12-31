import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateEvidenceListPDF, generateObjectionRecordPDF } from '../utils/pdf-export';
import Case from '../models/case.model';
const router = express.Router();

// 导出案件证据清单PDF
router.get('/cases/:caseId/evidence-list', authenticate, async (req: AuthRequest, res) => {
  try {
    const { caseId } = req.params;

    // 验证权限
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const userId = req.user?.userId;
    const hasAccess =
      caseDoc.prosecutorId?.toString() === userId ||
      caseDoc.judgeIds.some((id: any) => id.toString() === userId) ||
      caseDoc.lawyerIds.some((id: any) => id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const pdfBuffer = await generateEvidenceListPDF(caseId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="evidence-list-${caseDoc.caseNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 导出质证记录PDF
router.get('/cases/:caseId/objections', authenticate, async (req: AuthRequest, res) => {
  try {
    const { caseId } = req.params;

    // 验证权限
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const userId = req.user?.userId;
    const hasAccess =
      caseDoc.prosecutorIds?.toString() === userId ||
      caseDoc.judgeIds?.some((id: any) => id.toString() === userId) ||
      caseDoc.lawyerIds?.some((id: any) => id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const pdfBuffer = await generateObjectionRecordPDF(caseId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="objections-${caseDoc.caseNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

