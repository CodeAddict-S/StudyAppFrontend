<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Button } from "@/components/ui/button";
import { cn } from "@/misc/utils";
import { useSidebar } from "./utils";
import Icon from "@/components/misc/Icon.vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const { toggleSidebar } = useSidebar();
</script>

<template>
  <Button
    data-sidebar="trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7', props.class)"
    @click="toggleSidebar"
  >
    <Icon name="sidebar" size="md" />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
