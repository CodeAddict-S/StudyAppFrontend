<script setup>
import { cn } from "@/misc/utils";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <li :class="cn('inline-flex items-center gap-1.5', props.class)">
    <slot />
  </li>
</template>
