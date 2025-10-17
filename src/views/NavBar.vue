<template>
  <header class="flex items-center justify-between px-10 py-5 text-white">

    <div class="flex items-center gap-2 font-bold text-xl tracking-wide">
      <i class="pi pi-dove text-lg"></i>
      <span>PEACE<span class="font-normal">HUB</span></span>
    </div>


    <nav class="hidden md:flex items-center gap-10 text-base">
      <a href="#" class="hover:text-blue-200 transition-colors">About</a>
      <a href="#" class="hover:text-blue-200 transition-colors">Services</a>
      <a href="#" class="hover:text-blue-200 transition-colors">Resources</a>
      <a href="#" class="hover:text-blue-200 transition-colors">Contact</a>
    </nav>


    <Button
      label="Sign in"
      outlined
      class="!border-white !text-white hover:!bg-white hover:!text-blue-600 transition-all"
    />


    <Button
      icon="pi pi-bars"
      class="md:hidden !bg-transparent !border-0 !text-white"
      @click="menuVisible = !menuVisible"
    />


    <div
      v-if="menuVisible"
      class="absolute top-20 right-10 bg-white text-black rounded-lg shadow-lg p-5 flex flex-col gap-3 md:hidden"
    >
      <a href="#" class="hover:text-blue-600">About</a>
      <a href="#" class="hover:text-blue-600">Services</a>
      <a href="#" class="hover:text-blue-600">Resources</a>
      <a href="#" class="hover:text-blue-600">Contact</a>
      <Button
        label="Sign in"
        outlined
        class="!border-black !text-black hover:!bg-black hover:!text-white"
      />
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import Button from "primevue/button";

const menuVisible = ref(false);
</script>

<style scoped>
header {
  position: relative;
  z-index: 10;
}
</style>
