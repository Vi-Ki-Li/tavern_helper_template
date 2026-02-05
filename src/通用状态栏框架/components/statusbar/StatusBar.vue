<script setup lang="ts">
/**
 * 状态栏组件 - 浅色模式版本
 * 显示在每个 AI 消息楼层下方
 */
import { injectStreamingMessageContext } from '@util/streaming';

const ctx = injectStreamingMessageContext();

// SVG 图标路径
const databaseIcon =
  'M12 2C6.48 2 2 4.69 2 8v8c0 3.31 4.48 6 10 6s10-2.69 10-6V8c0-3.31-4.48-6-10-6zm0 2c4.42 0 8 1.79 8 4s-3.58 4-8 4-8-1.79-8-4 3.58-4 8-4zm8 12c0 2.21-3.58 4-8 4s-8-1.79-8-4v-2.18c1.86 1.38 4.78 2.18 8 2.18s6.14-.8 8-2.18V16z';
</script>

<template>
  <div class="status-bar">
    <div class="status-bar__header">
      <svg class="status-bar__icon" viewBox="0 0 24 24" width="18" height="18">
        <path :d="databaseIcon" fill="currentColor" />
      </svg>
      <span class="status-bar__title">通用状态栏</span>
      <span v-if="ctx.during_streaming" class="status-bar__streaming">生成中...</span>
    </div>
    <div class="status-bar__content">
      <div class="status-bar__placeholder">
        <span>暂无状态数据</span>
        <span class="status-bar__hint">点击扩展菜单中的「通用状态栏管理器」添加定义</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   浅色模式状态栏 - 玻璃拟态风格
   ============================================ */

.status-bar {
  --bar-bg: rgba(255, 255, 255, 0.92);
  --bar-border: rgba(0, 0, 0, 0.08);
  --bar-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;

  --color-primary: #6366f1;
  --color-success: #10b981;

  font-family:
    'Outfit',
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bar-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--bar-border);
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 12px;
  box-shadow: var(--bar-shadow);
}

.status-bar__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--bar-border);
}

.status-bar__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.status-bar__title {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
}

.status-bar__streaming {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  background: rgba(16, 185, 129, 0.12);
  color: var(--color-success);
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-bar__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-bar__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: var(--text-secondary);
  text-align: center;
}

.status-bar__hint {
  font-size: 12px;
  color: var(--text-tertiary);
}
</style>
