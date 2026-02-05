/**
 * 布局类型定义
 * 用于定义状态栏的可视化布局结构
 */

export type LayoutNodeType = 'row' | 'col' | 'item' | 'category' | 'placeholder';

export interface LayoutNode {
  id: string;
  type: LayoutNodeType;
  children?: LayoutNode[]; // Row has Cols; Col has Items
  props?: {
    width?: number; // Percent width for columns
    flex?: number;
    className?: string;
    style?: Record<string, string | number>; // CSS 属性键值对
  };
  data?: {
    key: string; // ItemDefinition.key or CategoryDefinition.key
  };
}

// v9.8: Layout Snapshot Type
export interface LayoutSnapshot {
  id: string;
  name: string;
  layout: LayoutNode[];
  timestamp: number;
}

// Helper to define the root structure (List of Rows)
export type LayoutStructure = LayoutNode[];
