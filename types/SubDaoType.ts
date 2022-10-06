export interface SubDAODeployFormData {
  name: string;
  githubUrl: string;
  description: string;
}

export interface SubDAOData {
  daoAddress: string;
  daoName: string;
  githubURL: string;
  description: string;
}

export interface SubDAODataWithMemberFlg {
  daoAddress: string;
  daoName: string;
  githubURL: string;
  description: string;
  isMember:boolean;
}
