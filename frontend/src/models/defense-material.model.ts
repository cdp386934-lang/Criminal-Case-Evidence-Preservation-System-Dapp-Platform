export interface DefenseMaterial{
    _id: string;
    caseId: string;
    title: string;
    description?: string;
    fileHash: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    materialType: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MaterialResponse {
    materials: DefenseMaterial[];
    total: number;
  }
  
  export interface MaterialFile {
    fileHash: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }
  
  export interface MaterialType {
    id: string;
    name: string;
  }
  
  export interface MaterialTypeResponse {
  }
  
  export interface CreateMaterialDTO {
    caseId: string;
    title: string;
    description?: string;
    fileHash: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    materialType: string;
  }
  
  export interface UpdateMaterialDTO {
    title?: string;
    description?: string;
    materialType?: string;
  }