import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Case from '../models/case.model';
import Evidence from '../models/evidence.model';
import Objection from '../models/objection.model';
import User from '../models/users.model';

/**
 * 生成案件存证证据清单PDF
 */
export const generateEvidenceListPDF = async (caseId: string): Promise<Buffer> => {
  const caseDoc = await Case.findById(caseId)
    .populate('prosecutorId', 'name')
    .populate('judgeIds', 'name')
    .populate('lawyerIds', 'name');

  if (!caseDoc) {
    throw new Error('Case not found');
  }

  const evidences = await Evidence.find({ caseId })
    .populate('uploaderId', 'name')
    .populate('verifiedBy', 'name')
    .sort({ createdAt: 1 });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const lineHeight = 20;
  const margin = 50;

  // 标题
  page.drawText('刑事案件存证证据清单', {
    x: margin,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  // 案件信息
  page.drawText(`案件编号：${caseDoc.caseNumber}`, {
    x: margin,
    y,
    size: 12,
    font: boldFont,
  });
  y -= lineHeight;

  page.drawText(`案件标题：${caseDoc.caseTitle}`, {
    x: margin,
    y,
    size: 12,
    font,
  });
  y -= lineHeight;

  page.drawText(`案件类型：${caseDoc.caseType}`, {
    x: margin,
    y,
    size: 12,
    font,
  });
  y -= lineHeight;

  page.drawText(`案件状态：${getCaseStatusText(caseDoc.status)}`, {
    x: margin,
    y,
    size: 12,
    font,
  });
  y -= lineHeight * 2;

  // 证据列表表格
  const tableStartY = y;
  const colWidths = [60, 120, 100, 80, 80, 80];
  const headers = ['序号', '证据标题', '证据类型', '上传时间', '状态', '核验人'];

  // 表头
  let x = margin;
  headers.forEach((header, index) => {
    page.drawText(header, {
      x,
      y,
      size: 10,
      font: boldFont,
    });
    x += colWidths[index];
  });
  y -= lineHeight;

  // 表格线
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + colWidths.reduce((a, b) => a + b, 0), y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 10;

  // 证据数据
  evidences.forEach((evidence, index) => {
    if (y < 100) {
      // 新页面
      const newPage = pdfDoc.addPage([595, 842]);
      y = 800;
    }

    x = margin;
    const rowData = [
      String(index + 1),
      evidence.title.substring(0, 15),
      getEvidenceTypeText(evidence.evidenceType),
      formatDate(evidence.createdAt),
      getEvidenceStatusText(evidence.status),
      (evidence.verifiedBy as any)?.name || '-',
    ];

    rowData.forEach((text, colIndex) => {
      page.drawText(text, {
        x,
        y,
        size: 9,
        font,
      });
      x += colWidths[colIndex];
    });
    y -= lineHeight;
  });

  // 页脚
  const pages = pdfDoc.getPages();
  pages.forEach((page, index) => {
    page.drawText(`第 ${index + 1} 页 / 共 ${pages.length} 页`, {
      x: margin,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`生成时间：${formatDate(new Date())}`, {
      x: 400,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

/**
 * 生成质证记录PDF
 */
export const generateObjectionRecordPDF = async (caseId: string): Promise<Buffer> => {
  const caseDoc = await Case.findById(caseId)
    .populate('prosecutorId', 'name')
    .populate('judgeIds', 'name')
    .populate('lawyerIds', 'name');

  if (!caseDoc) {
    throw new Error('Case not found');
  }

  const objections = await Objection.find({ caseId })
    .populate('lawyerId', 'name')
    .populate('evidenceId', 'title evidenceId')
    .populate('handledBy', 'name')
    .sort({ createdAt: 1 });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const lineHeight = 20;
  const margin = 50;

  // 标题
  page.drawText('质证记录', {
    x: margin,
    y,
    size: 20,
    font: boldFont,
  });
  y -= 40;

  // 案件信息
  page.drawText(`案件编号：${caseDoc.caseNumber}`, {
    x: margin,
    y,
    size: 12,
    font: boldFont,
  });
  y -= lineHeight;

  page.drawText(`案件标题：${caseDoc.caseTitle}`, {
    x: margin,
    y,
    size: 12,
    font,
  });
  y -= lineHeight * 2;

  // 质证记录
  objections.forEach((objection, index) => {
    if (y < 150) {
      const newPage = pdfDoc.addPage([595, 842]);
      y = 800;
    }

    page.drawText(`质证记录 ${index + 1}`, {
      x: margin,
      y,
      size: 12,
      font: boldFont,
    });
    y -= lineHeight;

    page.drawText(`证据：${(objection.evidenceId as any)?.title || '-'}`, {
      x: margin + 20,
      y,
      size: 10,
      font,
    });
    y -= lineHeight;

    page.drawText(`质证律师：${(objection.lawyerId as any)?.name || '-'}`, {
      x: margin + 20,
      y,
      size: 10,
      font,
    });
    y -= lineHeight;

    page.drawText(`质证意见：${objection.content}`, {
      x: margin + 20,
      y,
      size: 10,
      font,
    });
    y -= lineHeight;

    page.drawText(`处理状态：${getObjectionStatusText(objection.status)}`, {
      x: margin + 20,
      y,
      size: 10,
      font,
    });
    y -= lineHeight;

    if (objection.handledBy) {
      page.drawText(`处理人：${(objection.handledBy as any)?.name || '-'}`, {
        x: margin + 20,
        y,
        size: 10,
        font,
      });
      y -= lineHeight;

      page.drawText(`处理时间：${formatDate(objection.handledAt || objection.createdAt)}`, {
        x: margin + 20,
        y,
        size: 10,
        font,
      });
      y -= lineHeight;
    }

    y -= lineHeight;
  });

  // 页脚
  const pages = pdfDoc.getPages();
  pages.forEach((page, index) => {
    page.drawText(`第 ${index + 1} 页 / 共 ${pages.length} 页`, {
      x: margin,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`生成时间：${formatDate(new Date())}`, {
      x: 400,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

// 辅助函数
function getCaseStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    investigation: '侦查',
    prosecution: '审查起诉',
    trial: '庭审',
    closed: '结案',
  };
  return statusMap[status] || status;
}

function getEvidenceTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    image: '图片',
    video: '视频',
    audio: '音频',
    pdf: 'PDF文档',
    document: '文档',
    other: '其他',
  };
  return typeMap[type] || type;
}

function getEvidenceStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待核验',
    verified: '已核验',
    rejected: '已拒绝',
    corrected: '已补正',
  };
  return statusMap[status] || status;
}

function getObjectionStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    accepted: '已采信',
    rejected: '已拒绝',
  };
  return statusMap[status] || status;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

