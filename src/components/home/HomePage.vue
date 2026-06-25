<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ORDERED_CATEGORIES, CATEGORY_META } from '@/tools/categories'
import { getToolsByCategory, getTools } from '@/tools/registry'
import { Category, type Tool } from '@/tools/types'
import {
  ENCODE_ICON, GENERATE_ICON, NETWORK_ICON, MORE_ICON,
} from '@/utils/icons'
import { useBrand } from '@/composables/useBrand'

const router = useRouter()
const brand = useBrand()

const categoryIconMap: Record<Category, string> = {
  [Category.ENCODING]: ENCODE_ICON,
  [Category.GENERATION]: GENERATE_ICON,
  [Category.NETWORK]: NETWORK_ICON,
  [Category.MORE]: MORE_ICON,
}

const tools = getTools()

const navigateTo = (tool: Tool) => {
  router.push(tool.route)
}

// Compute stagger index across all categories
let globalIndex = 0
const delayMap = new Map<string, number>()
for (const cat of ORDERED_CATEGORIES) {
  for (const tool of getToolsByCategory(cat)) {
    delayMap.set(tool.id, globalIndex * 60)
    globalIndex++
  }
}
const getStaggerDelay = (toolId: string) => `${delayMap.get(toolId) ?? 0}ms`
</script>

<template>
  <div class="home-page" role="main">
    <!-- Hero Section -->
    <section class="hero" aria-label="站点介绍">
      <!-- Animated orbs -->
      <div class="hero-orb hero-orb--1" aria-hidden="true" />
      <div class="hero-orb hero-orb--2" aria-hidden="true" />
      <div class="hero-orb hero-orb--3" aria-hidden="true" />

      <!-- Dot pattern overlay -->
      <div class="hero-dots" aria-hidden="true" />

      <div class="hero-content">
        <h1 class="hero-title">{{ brand.siteName }}</h1>
        <p class="hero-subtitle">{{ brand.tagline }}</p>
        <p class="hero-sr-only">免费在线开发者工具集，涵盖 JSON 格式化、Base64 编解码、时间戳转换、UUID 生成、JWT 解析、哈希计算、二维码生成、URL 编解码等工具，所有处理在浏览器本地完成，即开即用。</p>
      </div>
    </section>

    <!-- Tool Showcase -->
    <section class="showcase" aria-label="工具列表">
      <template v-if="tools.length === 0">
        <div class="empty-state">
          <p>暂无工具</p>
        </div>
      </template>

      <template v-else>
        <div
          v-for="cat in ORDERED_CATEGORIES"
          :key="cat"
          class="category-section"
        >
          <div class="category-header">
            <span class="category-icon" v-html="categoryIconMap[cat]" />
            <span class="category-label">{{ CATEGORY_META[cat].label }}</span>
          </div>

          <div class="tool-grid">
            <div
              v-for="tool in getToolsByCategory(cat)"
              :key="tool.id"
              class="tool-card"
              tabindex="0"
              role="button"
              :aria-label="`打开 ${tool.name}`"
              :style="{ animationDelay: getStaggerDelay(tool.id) }"
              @click="navigateTo(tool)"
              @keydown.enter.prevent="navigateTo(tool)"
              @keydown.space.prevent="navigateTo(tool)"
            >
              <div class="card-icon" v-html="categoryIconMap[tool.category]" />
              <div class="card-content">
                <h3 class="card-name">{{ tool.name }}</h3>
                <p class="card-desc">{{ tool.description }}</p>
              </div>
              <span class="card-arrow" aria-hidden="true">&rarr;</span>
            </div>
          </div>
        </div>
      </template>
    </section>

    <!-- Footer -->
    <footer class="home-footer" v-if="tools.length > 0">
      <p>
        共 {{ tools.length }} 个工具 &middot;
        {{ new Set(tools.map(t => t.category)).size }} 个分类
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* ============================================
   Hero Section
   ============================================ */
.hero {
  position: relative;
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--app-bg-soft);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: var(--app-spacing-xl) var(--app-spacing-md);
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  background: var(--app-gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
  margin: 0 0 var(--app-spacing-sm);
}

.hero-subtitle {
  font-size: 18px;
  color: var(--app-text-muted);
  margin: 0;
  max-width: 480px;
  line-height: 1.6;
}

/* Screen-reader only — visible to search engines, hidden from visual display */
.hero-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Animated floating orbs */
.hero-orb {
  position: absolute;
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
  will-change: transform;
}

.hero-orb--1 {
  width: 420px;
  height: 420px;
  top: -15%;
  left: -5%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.18), transparent 70%);
  filter: blur(60px);
  animation: orbFloat1 14s ease-in-out infinite;
}

.hero-orb--2 {
  width: 360px;
  height: 360px;
  top: 20%;
  right: -8%;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.2), transparent 70%);
  filter: blur(60px);
  animation: orbFloat2 18s ease-in-out infinite;
}

.hero-orb--3 {
  width: 300px;
  height: 300px;
  bottom: -10%;
  left: 35%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.14), transparent 70%);
  filter: blur(50px);
  animation: orbFloat3 16s ease-in-out infinite;
}

/* Dot pattern overlay */
.hero-dots {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.06;
  background-image: radial-gradient(circle, var(--app-text-muted) 1px, transparent 1px);
  background-size: 24px 24px;
}

[data-theme="dark"] .hero-dots {
  opacity: 0.1;
}

/* Hero text entrance */
.hero-title,
.hero-subtitle {
  animation: heroFadeIn 0.7s ease-out both;
}

.hero-subtitle {
  animation-delay: 0.2s;
}

/* ============================================
   Tool Showcase
   ============================================ */
.showcase {
  max-width: var(--app-max-width);
  margin: 0 auto;
  padding: var(--app-spacing-xl) var(--app-spacing-lg);
}

.category-section {
  margin-bottom: var(--app-spacing-xl);
}

.category-header {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
  margin-bottom: var(--app-spacing-md);
  padding: 0 4px;
}

.category-icon {
  display: inline-flex;
  align-items: center;
  color: var(--app-primary);
  opacity: 0.85;
}

.category-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* Tool card grid */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--app-spacing-md);
}

/* Tool card */
.tool-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--app-spacing-md);
  padding: var(--app-spacing-lg);
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  animation: cardEnter 0.5s ease-out both;
  outline: none;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.12);
  border-color: var(--app-primary);
}

.tool-card:focus-visible {
  box-shadow: 0 0 0 2px var(--app-primary);
  border-color: var(--app-primary);
}

.card-icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  justify-content: center;
  color: var(--app-primary);
  transition: transform 0.3s ease;
}

.tool-card:hover .card-icon {
  transform: scale(1.12);
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--app-text);
  margin: 0 0 4px;
  line-height: 1.3;
}

.card-desc {
  font-size: 13px;
  color: var(--app-text-muted);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hover arrow */
.card-arrow {
  position: absolute;
  right: var(--app-spacing-lg);
  top: 50%;
  transform: translateY(-50%) translateX(-8px);
  font-size: 18px;
  color: var(--app-primary);
  opacity: 0;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.tool-card:hover .card-arrow {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--app-spacing-xl) 0;
  color: var(--app-text-muted);
  font-size: 16px;
}

/* ============================================
   Footer
   ============================================ */
.home-footer {
  text-align: center;
  padding: 0 var(--app-spacing-lg) var(--app-spacing-xl);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.home-footer p {
  font-size: 13px;
  color: var(--app-text-muted);
  margin: 0;
}

/* ============================================
   Keyframes
   ============================================ */
@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(50px, -25px) scale(1.1); }
  50%  { transform: translate(-15px, 35px) scale(0.9); }
  75%  { transform: translate(-35px, -15px) scale(1.05); }
}

@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1.05); }
  33%  { transform: translate(-40px, -30px) scale(0.9); }
  66%  { transform: translate(25px, 25px) scale(1.12); }
}

@keyframes orbFloat3 {
  0%, 100% { transform: translate(0, 0) scale(0.95); }
  50%  { transform: translate(30px, -45px) scale(1.18); }
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes heroFadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 1024px) {
  .hero-title { font-size: 40px; }
  .hero { min-height: 35vh; }
  .tool-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
}

@media (max-width: 768px) {
  .hero { min-height: 280px; }
  .hero-title { font-size: 32px; }
  .hero-subtitle { font-size: 15px; }
  .showcase { padding: var(--app-spacing-lg) var(--app-spacing-md); }
  .tool-grid { grid-template-columns: 1fr; }
  .tool-card { padding: var(--app-spacing-md); }
}

/* ============================================
   Accessibility — Reduced Motion
   ============================================ */
@media (prefers-reduced-motion: reduce) {
  .hero-orb--1,
  .hero-orb--2,
  .hero-orb--3,
  .hero-title,
  .hero-subtitle,
  .tool-card {
    animation: none !important;
  }
  .tool-card {
    opacity: 1 !important;
    transform: none !important;
  }
  .hero-orb {
    display: none;
  }
}

/* Mobile: suppress hover-only interactions */
@media (hover: hover) {
  /* hover styles already defined above, this block ensures
     touch devices don't get sticky hover states */
}
</style>
