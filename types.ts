export interface MindMapNodeData {
  id: string;
  name: string;
  description?: string;
  children?: MindMapNodeData[];
  isExpanded: boolean;
  isLoading: boolean;
  depth: number;
}