import { CreateDefenseMaterialDTO, UpdateDefenseMaterialDTO } from "../dto/defense-material.dto";
import {uploadMaterialToBlockchain} from "../utils/blockchain";
import {NotFoundError} from '../utils/errors'
import DefenseMaterial,{ IDefenseMaterial } from "../models/defense-material.model";
import  Case from "../models/case.model";

export const createDefenseMaterial = async (payload: CreateDefenseMaterialDTO): Promise<IDefenseMaterial> => {
    const casedDoc = await Case.findById(payload.caseId);
    if (!casedDoc) {
      throw new NotFoundError('Case not found');
    }
  
    const { materialId, txHash } = await uploadMaterialToBlockchain(
      casedDoc.caseNumber,
      payload.fileHash
    );
  
    const material = new DefenseMaterial({
      caseId: payload.caseId,
      lawyerId: payload.lawyerId,
      title: payload.title,
      description: payload.description,
      fileHash: payload.fileHash,
      fileName: payload.fileName,
      filePath: payload.filePath,
      fileSize: payload.fileSize,
      fileType: payload.fileType,
      materialType: payload.materialType,
      blockchainTxHash: txHash,
      blockchainMaterialId: materialId,
    });
  
    return material.save();
  };
  
export const updateDefenseMaterial = async (
    id: string,
    updates: UpdateDefenseMaterialDTO
  ): Promise<IDefenseMaterial> => {
    const updated = await DefenseMaterial.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      throw new NotFoundError('Defense material not found');
    }
    return updated;
  };
  
export const deleteDefenseMaterial = async (id: string): Promise<void> => {
    const deleted = await DefenseMaterial.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError('Defense material not found');
    }
  };
  
export const getDefenseMaterialById = async (id: string): Promise<IDefenseMaterial | null> => {
    return DefenseMaterial.findById(id)
      .populate('lawyerId', 'name email role')
      .populate('caseId', 'caseNumber caseTitle status');
  };
  
export const listDefenseMaterialsByCase = async (caseId: string): Promise<IDefenseMaterial[]> => {
    return DefenseMaterial.find({ caseId }).sort({ createdAt: -1 });
  };