<template>
  <!-- Tabs for Choosing Text -->
  <Tabs v-model="activeTab" class="w-full">
    <TabsList class="mb-5 grid w-full grid-cols-4">
      <TabsTrigger v-for="tab in texts" :value="tab.name">{{
        tab.label
      }}</TabsTrigger>
    </TabsList>
  </Tabs>
  <div class="relative flex flex-col gap-4 rounded-xl border p-4 shadow-sm">
    <!-- Controls for Active Text -->
    <div class="space-y-2">
      <div
        class="grid items-end gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        <div>
          <Label for="x_coordinate">X :</Label>
          <NumberField
            id="x_coordinate"
            :step="5"
            @update:model-value="(value) => handleCoordinateChange('x', value)"
            v-model="activeText.x"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>

        <div>
          <Label for="y_coordinate">Y :</Label>
          <NumberField
            id="y_coordinate"
            :step="5"
            @update:model-value="(value) => handleCoordinateChange('y', value)"
            v-model="activeText.y"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>

        <div>
          <Label for="text_size">Size :</Label>
          <NumberField
            id="text_size"
            :step="5"
            @update:model-value="handleSizeChange"
            v-model="activeText.size"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>
      </div>
    </div>

    <!-- Canvas for Image and Text Overlay -->
    <canvas ref="canvas" class="h-auto w-full rounded-lg border"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import QRCode from "qrcode";

import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "../ui/number-field";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";

const emit = defineEmits(["update:coordinates"]);
const props = defineProps({
  imageFile: File,
  initialCoordinates: Array,
});

const canvas = ref(null);
const ctx = ref(null);
const texts = ref(props.initialCoordinates);

const activeTab = ref("full_name");
const activeText = computed(() => {
  return texts.value.find((text) => text.name === activeTab.value);
});

const generateQRCode = async (text, size) =>
  QRCode.toDataURL(text, { width: size });

// LOAD THE IMAGE AND DRAW IT ON THE CANVAS

const loadImage = () => {
  if (!props.imageFile) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = e.target.result;
    img.onload = async () => {
      const canvasEl = canvas.value;
      ctx.value = canvasEl.getContext("2d");

      canvasEl.width = img.width;
      canvasEl.height = img.height;

      // DRAW THE IMAGE ON THE CANVAS

      ctx.value.drawImage(img, 0, 0, img.width, img.height);

      // DRAW TEXTS AND QR CODE

      await document.fonts.load("16px Montserrat");
      await document.fonts.ready;
      drawTexts();
    };
  };
  reader.readAsDataURL(props.imageFile);
};

// Draw all text overlays on the canvas
const drawTexts = async () => {
  if (!ctx.value) return;

  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

  const img = new Image();
  img.src = URL.createObjectURL(props.imageFile);
  img.onload = () => {
    ctx.value.drawImage(img, 0, 0, img.width, img.height);

    // Draw each text overlay
    texts.value.forEach((text) => {
      if (text.name !== "qr_code") {
        ctx.value.font = `${text.size}px Montserrat, Inter`;
        ctx.value.fillStyle = "black";
        ctx.value.strokeStyle = "black";
        ctx.value.textBaseline = "top";
        ctx.value.lineWidth = 2;
        ctx.value.strokeText(text.placeholder || text.label, text.x, text.y);
        ctx.value.fillText(text.placeholder || text.label, text.x, text.y);
      } else {
        generateQRCode("https://datasite.uz", text.size).then((qrCodeUrl) => {
          if (qrCodeUrl) {
            const qrCodeImg = new Image();
            qrCodeImg.src = qrCodeUrl;
            qrCodeImg.onload = () => {
              ctx.value.drawImage(
                qrCodeImg,
                text.x,
                text.y,
                text.size,
                text.size,
              );
            };
          }
        });
      }
    });
  };
};

// Handle coordinate changes
const handleCoordinateChange = (axis, value) => {
  activeText.value[axis] = value;
  emit("update:coordinates", texts.value);
};

// Handle size changes
const handleSizeChange = (value) => {
  activeText.value["size"] = value;
  emit("update:coordinates", texts.value);
};

// Watch for changes in the image file
const previousImageFile = ref(null);
watch(
  () => props.imageFile,
  (newFile) => {
    if (newFile !== previousImageFile.value) {
      previousImageFile.value = newFile;
      loadImage();
    }
  },
  { immediate: true },
);

// Watch for changes in initial coordinates
watch(
  () => props.initialCoordinates,
  (newCoordinates) => {
    if (newCoordinates) {
      texts.value = newCoordinates;
      drawTexts();
    }
  },
  { deep: true, immediate: true },
);

// SET UP

onMounted(async () => {
  loadImage();
});
</script>
