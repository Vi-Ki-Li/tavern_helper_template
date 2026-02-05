/**
 * TavernHelper API 服务封装
 *
 * 这个文件封装了与 SillyTavern / TavernHelper 交互的所有 API
 * 参考来源：
 *   - @types/function/variables.d.ts (变量 API)
 *   - @types/function/worldbook.d.ts (世界书 API)
 *   - 通用状态栏框架开发参考用文件/神话再临·数据库 (实际使用示例)
 */

import type { StatusBarData } from '../types/data';

// ============================================================================
// 常量定义
// ============================================================================

/** 状态栏数据在聊天变量中的存储键名 */
const STATUS_BAR_DATA_KEY = 'statusBarData';

/** 状态栏专用世界书名称前缀 */
const STATUS_BAR_WORLDBOOK_PREFIX = '状态栏-';

// ============================================================================
// 变量操作 API
// ============================================================================

/**
 * 获取状态栏数据
 * 从聊天变量中读取状态栏的完整数据结构
 */
export async function getStatusBarData(): Promise<StatusBarData | null> {
  try {
    const chatVariables = getVariables({ type: 'chat' });
    return chatVariables[STATUS_BAR_DATA_KEY] || null;
  } catch (error) {
    console.error('[状态栏] 获取状态栏数据失败:', error);
    return null;
  }
}

/**
 * 保存状态栏数据
 * 将状态栏数据保存到聊天变量中
 */
export async function saveStatusBarData(data: StatusBarData): Promise<boolean> {
  try {
    const chatVariables = getVariables({ type: 'chat' });
    chatVariables[STATUS_BAR_DATA_KEY] = data;
    await replaceVariables(chatVariables, { type: 'chat' });
    console.log('[状态栏] 数据已保存到聊天变量');
    return true;
  } catch (error) {
    console.error('[状态栏] 保存状态栏数据失败:', error);
    return false;
  }
}

/**
 * 更新状态栏数据的部分字段
 * 使用 lodash 的深度合并，只更新指定的字段
 */
export async function updateStatusBarData(
  updater: (data: StatusBarData) => StatusBarData,
): Promise<StatusBarData | null> {
  try {
    const result = await updateVariablesWith(
      variables => {
        const currentData = variables[STATUS_BAR_DATA_KEY] || createEmptyStatusBarData();
        variables[STATUS_BAR_DATA_KEY] = updater(currentData);
        return variables;
      },
      { type: 'chat' },
    );
    return result[STATUS_BAR_DATA_KEY];
  } catch (error) {
    console.error('[状态栏] 更新状态栏数据失败:', error);
    return null;
  }
}

// ============================================================================
// 世界书操作 API
// ============================================================================

/**
 * 获取所有世界书名称列表
 */
export function getAllWorldbookNames(): string[] {
  try {
    return getWorldbookNames();
  } catch (error) {
    console.error('[状态栏] 获取世界书列表失败:', error);
    return [];
  }
}

/**
 * 获取当前角色绑定的世界书
 */
export function getCurrentCharacterWorldbooks(): { primary: string | null; additional: string[] } {
  try {
    return getCharWorldbookNames('current');
  } catch (error) {
    console.error('[状态栏] 获取角色世界书失败:', error);
    return { primary: null, additional: [] };
  }
}

/**
 * 获取或创建状态栏专用世界书
 * 状态栏会将生成的定义条目注入到这个世界书中
 */
export async function getOrCreateStatusBarWorldbook(characterName: string): Promise<string> {
  const worldbookName = `${STATUS_BAR_WORLDBOOK_PREFIX}${characterName}`;
  const existingBooks = getAllWorldbookNames();

  if (!existingBooks.includes(worldbookName)) {
    await createWorldbook(worldbookName, []);
    console.log(`[状态栏] 已创建世界书: ${worldbookName}`);
  }

  return worldbookName;
}

/**
 * 获取世界书的所有条目
 */
export async function getWorldbookEntries(worldbookName: string): Promise<WorldbookEntry[]> {
  try {
    return await getWorldbook(worldbookName);
  } catch (error) {
    console.error(`[状态栏] 获取世界书 "${worldbookName}" 条目失败:`, error);
    return [];
  }
}

/**
 * 向世界书注入状态栏生成的条目
 * 这些条目会带有特殊标记，便于后续识别和更新
 */
export async function injectStatusBarEntries(
  worldbookName: string,
  entries: Array<{
    name: string;
    content: string;
    keys?: string[];
    enabled?: boolean;
  }>,
): Promise<boolean> {
  try {
    // 先删除旧的状态栏生成条目（通过 extra 字段识别）
    await deleteWorldbookEntries(worldbookName, entry => {
      return entry.extra?.generatedBy === 'statusBar';
    });

    // 创建新条目
    const newEntries = entries.map(e => ({
      name: e.name,
      content: e.content,
      enabled: e.enabled ?? true,
      strategy: {
        type: 'constant' as const, // 常量类型，始终激活
        keys: e.keys || [],
        keys_secondary: { logic: 'and_any' as const, keys: [] },
        scan_depth: 'same_as_global' as const,
      },
      position: {
        type: 'after_character_definition' as const,
        role: 'system' as const,
        depth: 0,
        order: 100,
      },
      probability: 100,
      recursion: {
        prevent_incoming: false,
        prevent_outgoing: false,
        delay_until: null,
      },
      effect: {
        sticky: null,
        cooldown: null,
        delay: null,
      },
      extra: {
        generatedBy: 'statusBar',
        generatedAt: Date.now(),
      },
    }));

    await createWorldbookEntries(worldbookName, newEntries);
    console.log(`[状态栏] 已向世界书 "${worldbookName}" 注入 ${entries.length} 个条目`);
    return true;
  } catch (error) {
    console.error(`[状态栏] 注入条目到世界书 "${worldbookName}" 失败:`, error);
    return false;
  }
}

/**
 * 更新世界书中的单个条目
 */
export async function updateWorldbookEntry(
  worldbookName: string,
  uid: number,
  updates: Partial<WorldbookEntry>,
): Promise<boolean> {
  try {
    await updateWorldbookWith(worldbookName, entries => {
      return entries.map(entry => {
        if (entry.uid === uid) {
          return { ...entry, ...updates };
        }
        return entry;
      });
    });
    return true;
  } catch (error) {
    console.error(`[状态栏] 更新世界书条目失败:`, error);
    return false;
  }
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 创建空的状态栏数据结构
 */
export function createEmptyStatusBarData(): StatusBarData {
  return {
    categories: {},
    item_definitions: {},
    id_map: {},
    shared: {},
    characters: {},
    character_meta: {},
    _meta: {
      message_count: 0,
      last_updated: new Date().toISOString(),
      version: 1,
    },
  };
}

/**
 * 获取当前角色名称
 */
export function getCurrentCharacterName(): string | null {
  try {
    // TavernHelper 提供的获取当前角色的方法
    // 参考 @types/function/character.d.ts
    const names = getCharacterNames();
    return names.length > 0 ? names[0] : null;
  } catch {
    return null;
  }
}

/**
 * 获取当前聊天的消息列表
 */
export function getChatMessages(): ChatMessage[] {
  try {
    // 参考 @types/function/chat_message.d.ts
    return getChatMessages_tavern();
  } catch {
    return [];
  }
}

// ============================================================================
// 内部函数别名（避免与导出函数同名）
// ============================================================================

const getChatMessages_tavern = (): ChatMessage[] => {
  // 这里使用全局的 getChat 函数

  return (globalThis as any).getChat?.() ?? [];
};
