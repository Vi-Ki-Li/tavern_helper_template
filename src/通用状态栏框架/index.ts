/**
 * 通用状态栏框架 - 入口文件
 *
 * 这是一个"定义驱动"的状态栏框架，所有行为都由用户配置的定义决定
 *
 * 架构：
 * - Manager（管理器）：主窗口 overlay，用于编辑定义、样式、布局
 * - StatusBar（状态栏）：iframe 内显示，确保样式隔离
 */

import { teleportStyle } from '@util/script';
import { mountStreamingMessages } from '@util/streaming';

// Vue 组件
import ManagerModal from '@/通用状态栏框架/components/manager/ManagerModal.vue';
import StatusBar from '@/通用状态栏框架/components/statusbar/StatusBar.vue';

// ============================================================================
// 常量
// ============================================================================

const MANAGER_BUTTON_NAME = '通用状态栏管理器';
const MANAGER_CONTAINER_ID = 'th-statusbar-manager-container';
const OWNER_KEY = '__th_statusbar_owner__';

// ============================================================================
// 类型
// ============================================================================

interface OwnerRecord {
  id: string;
  cleanup: () => void;
}

// ============================================================================
// 单例所有权管理（防止多个脚本实例同时运行）
// ============================================================================

const pageWindow = window.parent ?? window;

function createId(): string {
  return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOwner(): OwnerRecord | null {
  return (pageWindow as any)[OWNER_KEY] ?? null;
}

function setOwner(record: OwnerRecord): void {
  (pageWindow as any)[OWNER_KEY] = record;
}

function clearOwner(): void {
  delete (pageWindow as any)[OWNER_KEY];
}

// ============================================================================
// 管理器 UI（主窗口 overlay）
// ============================================================================

let $managerContainer: JQuery<HTMLElement> | null = null;
let managerApp: ReturnType<typeof createApp> | null = null;
let managerStyleCleanup: (() => void) | null = null;

/**
 * 创建管理器容器
 */
function createManagerContainer(): JQuery<HTMLElement> {
  const $existing = pageWindow.document.querySelector(`#${MANAGER_CONTAINER_ID}`);
  if ($existing) {
    $existing.remove();
  }

  const $container = $(pageWindow.document.createElement('div'))
    .attr('id', MANAGER_CONTAINER_ID)
    .css({
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 99999,
      display: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    })
    .appendTo(pageWindow.document.body);

  // 监听管理器关闭事件
  pageWindow.document.documentElement.addEventListener('th:manager-close', hideManager);

  return $container;
}

/**
 * 显示管理器
 */
async function showManager(): Promise<void> {
  if (!$managerContainer) return;

  $managerContainer.css('display', 'flex');

  // 如果还没挂载 Vue 应用，现在挂载
  if (!managerApp) {
    // 把样式从脚本 iframe 复制到主窗口
    // teleportStyle 默认复制当前 document 的 head > style 到目标
    // 这里的目标是主窗口的 head
    managerStyleCleanup = teleportStyle($(pageWindow.document.head)).destroy;

    const $mountPoint = $('<div>').appendTo($managerContainer!);
    managerApp = createApp(ManagerModal);
    managerApp.mount($mountPoint[0]);
  }

  console.log('[状态栏] 管理器已打开');
}

/**
 * 隐藏管理器
 */
function hideManager(): void {
  if (!$managerContainer) return;
  $managerContainer.css('display', 'none');
  console.log('[状态栏] 管理器已关闭');
}

/**
 * 切换管理器显示状态
 */
function toggleManager(): void {
  if (!$managerContainer) return;
  const isVisible = $managerContainer.css('display') !== 'none';
  if (isVisible) {
    hideManager();
  } else {
    showManager();
  }
}

// ============================================================================
// 状态栏 UI（流式楼层界面）
// ============================================================================

let statusBarUnmount: (() => void) | null = null;

/**
 * 初始化状态栏（使用流式楼层界面）
 */
async function initStatusBar(): Promise<void> {
  const { unmount } = mountStreamingMessages(() => createApp(StatusBar), {
    host: 'iframe', // 使用 iframe 隔离样式
    // 只在 AI 消息上显示状态栏
    filter: (message_id, _message) => {
      const chat = getChatMessages(message_id);
      if (chat.length === 0) return false;
      // 只在 AI 回复上显示（role 为 assistant）
      return chat[0].role === 'assistant';
    },
  });

  statusBarUnmount = unmount;
  console.log('[状态栏] 流式界面已初始化');
}

// ============================================================================
// 暴露 API 到主窗口（供调试和外部调用）
// ============================================================================

function exposeAPI(): void {
  (pageWindow as any).__thStatusBarManager = {
    show: showManager,
    hide: hideManager,
    toggle: toggleManager,
    isVisible: () => $managerContainer?.css('display') !== 'none',
  };
}

// ============================================================================
// 初始化
// ============================================================================

function init(): void {
  const currentId = createId();

  // 检查是否已有其他实例在运行
  const existingOwner = getOwner();
  if (existingOwner) {
    console.log('[状态栏] 检测到旧实例，正在清理...');
    existingOwner.cleanup();
  }

  // 注册当前实例
  const cleanup = () => {
    console.log('[状态栏] 正在清理...');

    // 卸载管理器
    if (managerApp) {
      managerApp.unmount();
      managerApp = null;
    }
    // 清理管理器样式
    managerStyleCleanup?.();
    managerStyleCleanup = null;

    $managerContainer?.remove();
    $managerContainer = null;

    // 卸载状态栏
    statusBarUnmount?.();
    statusBarUnmount = null;

    // 移除按钮
    replaceScriptButtons([]);

    // 清除 API
    delete (pageWindow as any).__thStatusBarManager;

    clearOwner();
  };

  setOwner({ id: currentId, cleanup });

  // 创建管理器容器
  $managerContainer = createManagerContainer();

  // 点击背景关闭管理器
  $managerContainer.on('click', e => {
    if (e.target === $managerContainer![0]) {
      hideManager();
    }
  });

  // 添加管理器按钮
  replaceScriptButtons([{ name: MANAGER_BUTTON_NAME, visible: true }]);

  // 注册按钮点击事件
  eventOn(getButtonEvent(MANAGER_BUTTON_NAME), showManager);

  // 初始化状态栏
  initStatusBar();

  // 暴露 API
  exposeAPI();

  console.log('[状态栏] 初始化完成');
}

// ============================================================================
// 入口点
// ============================================================================

$(() => {
  try {
    init();
  } catch (error: any) {
    console.error('[状态栏] 初始化失败:', error);
    toastr.error(`状态栏初始化失败: ${error.message}`, '错误');
  }

  // 卸载时清理
  $(window).on('pagehide', () => {
    const owner = getOwner();
    owner?.cleanup();
  });
});
