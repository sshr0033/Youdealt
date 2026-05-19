<template>
  <NavBar/>
  <section class="hero">
    <div class="hero__frame">
      <div class="hero__bg">
        <div class="hero__overlay"></div>
      </div>
      <div class="hero__content">
        <h1 class="hero__title">
          Your Journey to achieve<br />
          Mental Wellness
        </h1>
        <p class="hero__subtitle">
          Include us in your journey to explore therapies, mindfulness and wellness support,
          designed to help you thrive; we help you track your achievements and motivate you
          to grow towards a healthier mind and body.
        </p>
        <Button
          v-ripple
          class="hero__cta"
          size="large"
          rounded
          label="Goals →"
          @click="router.push('/goals')"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import NavBar from './NavBar.vue'

const router = useRouter()

// Demo user - no authentication needed
const demoUser = {
  name: "Demo User",
  email: "demo@youthealth.app"
}
</script>

<style scoped>
.hero {
  min-height: 10dvh;
  min-width: 98vw;
  display: grid;
  place-items: stretch;
  padding: 1px;
  background: #e9e8f6;
}
.hero__frame {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  outline: 6px solid rgba(163, 171, 255, 0.18);
  min-height: calc(100dvh - 24px);
  background: #0e1525;
}
.hero__nav {
  position: absolute;
  inset: 0 0 auto 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  z-index: 4;
  pointer-events: none;
}
.brand {
  font-weight: 800;
  font-size: 22px;
  letter-spacing: 0.2px;
  pointer-events: auto;
}
.brand__you { color: #e6f0ff; }
.brand__dealt { margin-left: 2px; color: #87c8ff; }
.hero__bg {
  position: absolute;
  inset: 0;
  background-image: url('../assets/homepagee.jpg');
  background-size: cover;
  background-position: center;
  filter: saturate(1.05);
}
.hero__overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1200px 600px at 60% 70%, rgba(0,0,0,0.15), rgba(0,0,0,0.55)),
    linear-gradient(180deg, rgba(107,158,255,0.20), rgba(168,132,255,0.22));
  backdrop-filter: blur(0.7px);
}
.hero__content {
  position: relative;
  z-index: 3;
  min-height: calc(100dvh - 24px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  text-align: center;
  padding: 40px 16px;
  color: #fff;
}
.hero__title {
  font-size: clamp(28px, 5.8vw, 56px);
  line-height: 1.06;
  margin: 0;
  font-weight: 800;
  letter-spacing: 0.2px;
  text-shadow: 0 6px 24px rgba(0,0,0,0.35);
}
.hero__subtitle {
  max-width: 720px;
  font-size: clamp(13px, 1.6vw, 16px);
  line-height: 1.7;
  color: rgba(255,255,255,0.92);
  text-wrap: balance;
}
.hero__cta :deep(.p-button) { font-weight: 700; }
.hero__cta {
  --p-button-bg: #5fa8ff;
  --p-button-hover-bg: #4c99fa;
  --p-button-text-color: #0a0a0a;
  --p-button-border-color: transparent;
  box-shadow: 0 10px 30px rgba(90,160,255,0.35);
}
@media (max-width: 640px) {
  .hero__subtitle { padding: 0 6px; }
}
</style>
