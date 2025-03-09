<script setup>
import { cn } from "@/misc/utils";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div class="relative w-full overflow-auto rounded-xl border">
    <table :class="cn('w-full caption-bottom text-sm', props.class)">
      <slot />
    </table>
  </div>
</template>
