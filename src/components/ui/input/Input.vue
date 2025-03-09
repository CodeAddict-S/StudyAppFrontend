<script setup>
import { cn } from "@/misc/utils";
import { useVModel } from "@vueuse/core";

const props = defineProps({
  defaultValue: { type: [String, Number], required: false },
  modelValue: { type: [String, Number], required: false },
  class: { type: null, required: false },
});

const emits = defineEmits(["update:modelValue"]);

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});

const updateValue = (event) => {
  emits("update:modelValue", event.target.value);
};
</script>

<template>
  <input
    :value="modelValue"
    @input="updateValue"
    :class="
      cn(
        'flex h-9 w-full truncate rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
