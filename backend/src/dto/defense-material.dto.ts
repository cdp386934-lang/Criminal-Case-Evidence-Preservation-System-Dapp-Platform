import { MaterialType } from "../models/defense-material.model";

export interface CreateDefenseMaterialDTO {
  caseId: string;
  lawyerId: string;
  title: string;
  description?: string;
  fileHash: string;
  fileName: string;
  filePath?: string;
  fileSize: number;
  fileType: string;
  materialType: MaterialType;
}

export interface UpdateDefenseMaterialDTO {
  title?: string;
  description?: string;
  materialType?: MaterialType;
}
