<template>
  <div class="space-y-2">
    <Label v-if="label">{{ label }}</Label>
    <div
      class="relative rounded-xl border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-gray-400"
      @dragover.prevent="dragover"
      @dragleave.prevent="dragleave"
      @drop.prevent="drop"
    >
      <input
        :id="id"
        type="file"
        ref="fileInput"
        class="hidden"
        accept="image/*"
        @change="handleFileChange"
      />
      <div
        v-if="!previewUrl"
        class="flex flex-col items-center justify-center gap-2"
      >
        <Icon name="upload" size="2xl" class="text-gray-400" />
        <p class="text-sm text-gray-500">
          Drag & drop an image or
          <span class="cursor-pointer text-primary" @click="openFilePicker"
            >browse</span
          >
        </p>
      </div>
      <div v-else class="relative">
        <img
          :src="previewUrl"
          alt="Uploaded Image"
          class="h-auto max-w-full rounded-xl border"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="absolute right-2 top-2 rounded-full border-2 border-dashed bg-white/80 text-sm hover:bg-white"
          @click="clearImage"
        >
          <Icon name="cross" size="sm" class="p-2" />
        </Button>
      </div>
    </div>
    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  label: String,
  modelValue: File,
  error: String,
  id: String,
});

const fileInput = ref(null);
const previewUrl = ref("");
const isDragging = ref(false);

// Open file picker
const openFilePicker = () => {
  fileInput.value.click();
};

// Handle file change
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    previewUrl.value = URL.createObjectURL(file);
    emit("update:modelValue", file);
  }
};

watch(
  () => props.modelValue,
  (newFile) => {
    if (newFile) {
      previewUrl.value = URL.createObjectURL(newFile);
    } else {
      previewUrl.value = "";
    }
  },
  { immediate: true },
);

watch(previewUrl, (newUrl, oldUrl) => {
  if (oldUrl) {
    URL.revokeObjectURL(oldUrl);
  }
});

// Drag and drop handlers
const dragover = () => {
  isDragging.value = true;
};

const dragleave = () => {
  isDragging.value = false;
};

const drop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    previewUrl.value = URL.createObjectURL(file);
    emit("update:modelValue", file);
  }
};

// Clear image
const clearImage = () => {
  previewUrl.value = "";
  emit("update:modelValue", null);
  fileInput.value.value = "";
};
</script>
