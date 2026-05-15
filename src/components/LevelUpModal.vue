<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="overlay" @click.self="$emit('close')">
        <div class="modal">
          <div class="stars">✨</div>
          <div class="level-ring">
            <span class="level-num">{{ level }}</span>
          </div>
          <h2>Level Up!</h2>
          <p class="sub">You reached level {{ level }}. Keep going!</p>

          <div v-if="coupon" class="coupon-box">
            <div class="coupon-top">
              <div class="coupon-shop-info">
                <span class="coupon-shop">{{ coupon.shop }}</span>
                <span class="coupon-label">Reward coupon</span>
              </div>
              <span class="coupon-pct">{{ coupon.discount }}%<br/><span class="off-text">OFF</span></span>
            </div>
            <div class="coupon-divider">
              <span></span><span class="divider-text">COUPON CODE</span><span></span>
            </div>
            <div class="coupon-code">{{ coupon.code }}</div>
            <p class="coupon-hint">Saved to your profile · Use at checkout on {{ coupon.shop }}</p>
          </div>

          <button @click="$emit('close')" class="btn btn-primary close-btn">
            Let's go! 🚀
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Coupon } from '../types'
defineProps<{
  show: boolean
  level: number
  coupon: Coupon | null
}>()
defineEmits(['close'])
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 36px 28px 28px;
  width: 100%;
  max-width: 360px;
  text-align: center;
}

.stars { font-size: 32px; margin-bottom: 16px; }

.level-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  background: rgba(124, 92, 252, 0.1);
}
.level-num {
  font-size: 28px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}

h2 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}
.sub {
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 24px;
}

.coupon-box {
  background: var(--bg);
  border: 1px dashed rgba(124, 92, 252, 0.5);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: left;
}

.coupon-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.coupon-shop-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.coupon-shop {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}
.coupon-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.coupon-pct {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
  text-align: right;
}
.off-text {
  font-size: 12px;
  font-weight: 700;
  display: block;
}

.coupon-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.coupon-divider span:first-child,
.coupon-divider span:last-child {
  flex: 1;
  height: 1px;
  background: var(--border);
  display: block;
}
.divider-text {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.coupon-code {
  font-family: 'Courier New', monospace;
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.12em;
  background: var(--bg-card2);
  padding: 10px 12px;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 8px;
}

.coupon-hint {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}

.close-btn {
  width: 100%;
  justify-content: center;
  padding: 11px;
  font-size: 14px;
}

.modal-enter-active, .modal-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-enter-from { opacity: 0; transform: scale(0.85); }
.modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
