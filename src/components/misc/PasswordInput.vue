<script setup>
import { ref, watch } from "vue";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const emits = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: String,
  placeholder: String,
  showRandomizer: {
    type: Boolean,
    default: true,
  },
  id: [Number, String],
});

const reveal = ref(false);
const localValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  },
);

const updateValue = (value) => {
  localValue.value = value;
  emits("update:modelValue", value);
};

const generateRandomPassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]\\|:;\"'<>,.?/~`";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  updateValue(password);
  reveal.value = true;
};
</script>

<template>
  <div class="flex rounded-md">
    <Input
      :id="id"
      v-model="localValue"
      @input="updateValue($event.target.value)"
      :type="reveal ? 'text' : 'password'"
      class="rounded-e-none border-e-0"
      :placeholder="placeholder"
      autocomplete="on"
    />
    <Button
      v-if="showRandomizer"
      type="button"
      variant="outline"
      size="icon"
      class="rounded-none border-r-0"
      @click="generateRandomPassword"
    >
      <Icon name="dice-alt" />
    </Button>
    <Button
      type="button"
      variant="outline"
      size="icon"
      class="rounded-l-none border"
      @click="reveal = !reveal"
    >
      <Icon :name="reveal ? 'eye-crossed' : 'eye'" class="size-4" />
    </Button>
  </div>
</template>
