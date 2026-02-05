<script setup lang="ts">
/**
 * 管理器模态框 - 浅色模式版本
 *
 * 基于 UI 参考的设计系统，实现现代玻璃拟态风格
 */
import { ref } from 'vue';

const activeTab = ref<'data' | 'definitions' | 'styles' | 'layout' | 'config'>('data');

const tabs = [
  { key: 'data', name: '数据中心', icon: 'database' },
  { key: 'definitions', name: '定义工坊', icon: 'wrench' },
  { key: 'styles', name: '样式工坊', icon: 'palette' },
  { key: 'layout', name: '布局编排', icon: 'layout' },
  { key: 'config', name: '系统配置', icon: 'settings' },
] as const;

// SVG 图标路径 (Material Design Icons)
const iconPaths: Record<string, string> = {
  database:
    'M12 2C6.48 2 2 4.69 2 8v8c0 3.31 4.48 6 10 6s10-2.69 10-6V8c0-3.31-4.48-6-10-6zm0 2c4.42 0 8 1.79 8 4s-3.58 4-8 4-8-1.79-8-4 3.58-4 8-4zm8 12c0 2.21-3.58 4-8 4s-8-1.79-8-4v-2.18c1.86 1.38 4.78 2.18 8 2.18s6.14-.8 8-2.18V16z',
  wrench:
    'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  palette:
    'M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm5.5 11c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-3-4c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zM5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S7.33 13 6.5 13 5 12.33 5 11.5zm6-4c0 .83-.67 1.5-1.5 1.5S8 8.33 8 7.5 8.67 6 9.5 6s1.5.67 1.5 1.5z',
  layout: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z',
  settings:
    'M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  save: 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z',
};

function handleClose() {
  // 事件需要发送到主窗口（Vue 组件虽然挂载在主窗口 DOM，但脚本运行在 iframe 中）
  const targetDocument = (window.parent ?? window).document;
  const event = new CustomEvent('th:manager-close');
  targetDocument.documentElement.dispatchEvent(event);
}
</script>

<template>
  <div class="manager-modal" @click.stop>
    <!-- 标题栏 -->
    <header class="manager-modal__header">
      <div class="manager-modal__title">
        <svg class="manager-modal__title-icon" viewBox="0 0 24 24" width="24" height="24">
          <path :d="iconPaths.database" fill="currentColor" />
        </svg>
        <h1>通用状态栏管理器</h1>
      </div>
      <div class="manager-modal__actions">
        <button class="manager-modal__btn manager-modal__btn--primary" type="button">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path :d="iconPaths.save" fill="currentColor" />
          </svg>
          <span>保存</span>
        </button>
        <button class="manager-modal__btn manager-modal__btn--close" type="button" @click="handleClose">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path :d="iconPaths.close" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>

    <!-- 标签栏 -->
    <nav class="manager-modal__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="manager-modal__tab"
        :class="{ 'manager-modal__tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <svg class="manager-modal__tab-icon" viewBox="0 0 24 24" width="18" height="18">
          <path :d="iconPaths[tab.icon]" fill="currentColor" />
        </svg>
        <span class="manager-modal__tab-name">{{ tab.name }}</span>
      </button>
    </nav>

    <!-- 内容区 -->
    <main class="manager-modal__content">
      <div class="manager-modal__placeholder">
        <svg class="manager-modal__placeholder-icon" viewBox="0 0 24 24" width="72" height="72">
          <path :d="iconPaths[tabs.find(t => t.key === activeTab)?.icon || 'database']" fill="currentColor" />
        </svg>
        <h2>{{ tabs.find(t => t.key === activeTab)?.name }}</h2>
        <p class="manager-modal__placeholder-text">此模块正在开发中...</p>
        <p class="manager-modal__placeholder-hint">框架已成功加载！后续将逐步完善各项功能</p>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="manager-modal__footer">
      <span>通用状态栏框架 v0.1.0</span>
      <span class="manager-modal__footer-status">浅色模式 · 开发中</span>
    </footer>
  </div>
</template>

<style scoped>
/* ============================================
   浅色模式设计系统 - 基于 UI 参考
   ============================================ */

.manager-modal {
  --modal-bg: rgba(255, 255, 255, 0.95);
  --modal-border: rgba(0, 0, 0, 0.08);
  --modal-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;

  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-primary-subtle: rgba(99, 102, 241, 0.1);
  --color-success: #10b981;
  --color-danger: #ef4444;

  --surface-hover: rgba(0, 0, 0, 0.03);
  --surface-active: rgba(99, 102, 241, 0.1);

  width: 90vw;
  max-width: 1000px;
  height: 80vh;
  max-height: 700px;

  background: var(--modal-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--modal-border);
  border-radius: 16px;
  box-shadow: var(--modal-shadow);

  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: auto;

  font-family:
    'Outfit',
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
}

/* 标题栏 */
.manager-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid var(--modal-border);
}

.manager-modal__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manager-modal__title-icon {
  color: var(--color-primary);
}

.manager-modal__title h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.manager-modal__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 按钮 */
.manager-modal__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.manager-modal__btn--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.manager-modal__btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.manager-modal__btn--close {
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--surface-hover);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.manager-modal__btn--close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

/* 标签栏 */
.manager-modal__tabs {
  display: flex;
  gap: 4px;
  padding: 12px 24px;
  background: rgba(249, 250, 251, 0.8);
  border-bottom: 1px solid var(--modal-border);
}

.manager-modal__tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.manager-modal__tab:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.manager-modal__tab--active {
  background: var(--surface-active);
  color: var(--color-primary);
}

.manager-modal__tab--active:hover {
  background: var(--surface-active);
  color: var(--color-primary);
}

.manager-modal__tab-icon {
  flex-shrink: 0;
}

/* 内容区 */
.manager-modal__content {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: linear-gradient(180deg, rgba(249, 250, 251, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
}

.manager-modal__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.manager-modal__placeholder-icon {
  color: var(--color-primary);
  opacity: 0.6;
  margin-bottom: 20px;
}

.manager-modal__placeholder h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.manager-modal__placeholder-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 15px;
}

.manager-modal__placeholder-hint {
  margin: 12px 0 0;
  color: var(--color-success);
  font-size: 13px;
  font-weight: 500;
}

/* 底部 */
.manager-modal__footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(249, 250, 251, 0.9);
  border-top: 1px solid var(--modal-border);
  font-size: 12px;
  color: var(--text-tertiary);
}

.manager-modal__footer-status {
  color: var(--color-primary);
  font-weight: 500;
}

/* 滚动条 */
.manager-modal__content::-webkit-scrollbar {
  width: 6px;
}

.manager-modal__content::-webkit-scrollbar-track {
  background: transparent;
}

.manager-modal__content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.manager-modal__content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}
</style>
