<script setup>
import { cn } from "@/misc/utils";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    data-sidebar="footer"
    :class="
      cn(
        'flex flex-col gap-2 p-2 duration-150 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-1',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
