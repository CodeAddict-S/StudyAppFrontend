<script setup>
import { cn } from "@/misc/utils";
import { Label } from "reka-ui";
import { computed } from "vue";

const props = defineProps({
  for: { type: String, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
});

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <Label
    v-bind="delegatedProps"
    asChild
    :class="
      cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class,
      )
    "
  >
    <span>
      <slot />
    </span>
  </Label>
</template>
