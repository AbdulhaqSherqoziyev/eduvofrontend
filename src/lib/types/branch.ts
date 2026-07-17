export interface Branch {
  id: string;
  name: string;
  brandName: string;
  isRoot: boolean;
  isCurrent: boolean;
  studentCount: number;
  status: string | null;
  createdAt: string;
}

export interface CreateBranchInput {
  name: string;
  brandName?: string;
}
