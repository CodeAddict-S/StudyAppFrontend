<template>
  <div class="flex items-center justify-center">
    <div
      class="flex items-center gap-1 rounded-l-xl border-l-0 bg-muted p-2 text-sm"
    >
      <img src="/uzbekistan_flag.png" class="h-3" />
      <span class="pr-2.5">+998</span>
    </div>
    <Input
      :disabled="disabled"
      v-model="localValue"
      @input="updateValue"
      maxlength="9"
      :placeholder="placeholder"
      autocomplete="mobile"
      :id="id"
      class="rounded-l-none border-l-0"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

import { Input } from "@/components/ui/input";

const emits = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: String,
  placeholder: String,
  id: [Number, String],
  disabled: Boolean,
});

const localValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  },
);

const updateValue = (event) => {
  const numericValue = event.target.value.replace(/\D/g, "");
  const trimmedValue = numericValue.slice(0, 9);
  localValue.value = trimmedValue;
  emits("update:modelValue", trimmedValue);
  event.target.value = trimmedValue;
};
</script>
