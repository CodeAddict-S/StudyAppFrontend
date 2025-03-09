<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-2 bg-gradient-to-t from-lime-600 to-lime-500 bg-clip-text text-transparent"
  >
    <p class="text-7xl">404</p>
    <p class="text-3xl">Sahifa topilmadi</p>
    <router-link to="/">
      <Button
        >Bosh Sahifaga Qaytish
        <ArrowRight />
      </Button>
    </router-link>
  </div>
</template>

<script setup>
import Button from "@/components/ui/button/Button.vue";
import { ArrowRight } from "lucide-vue-next";
</script>
