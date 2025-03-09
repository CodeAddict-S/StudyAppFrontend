<template>
  <i :class="iconClasses" />
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "md",
  },
  variant: {
    type: String,
    default: "rr",
  },
});

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

const iconClasses = computed(() => {
  const sizeClass = sizeClasses[props.size] || sizeClasses.lg;
  return `fi fi-${props.variant}-${props.name} ${sizeClass}`;
});
</script>
