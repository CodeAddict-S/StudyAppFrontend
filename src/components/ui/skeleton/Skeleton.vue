<script setup>
import { cn } from "@/misc/utils";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div :class="cn('animate-pulse rounded-xl bg-foreground/10', props.class)" />
</template>
