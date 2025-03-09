<template>
  <Dialog :open="isOpen" @update:open="$emit('closed')">
    <DialogContent
      :class="{ 'sm:max-w-max': formData.image }"
      @interactOutside="$event.preventDefault()"
    >
      <DialogHeader>
        <DialogTitle
          >Kursni {{ editMode ? "Tahrirlash" : "Yaratish" }}</DialogTitle
        >
        <DialogDescription />
      </DialogHeader>
      <!-- FORM -->

      <form
        @submit.prevent="onSubmit"
        class="flex flex-col gap-4"
        :class="{ 'w-full': !formData.image }"
        enctype="multipart/form-data"
      >
        <div
          class="flex max-h-[500px] gap-4 overflow-auto"
          :class="{ 'flex-col': !formData.image }"
        >
          <div>
            <div v-for="field in formFields" class="flex flex-col gap-4 p-0.5">
              <!-- NORMAL INPUT -->

              <div v-if="field.type === 'text'" class="space-y-1">
                <Label :for="field.name">{{ field.label }}</Label>
                <Input
                  :id="field.name"
                  v-model="formData[field.name]"
                  :autocomplete="field.name"
                  :placeholder="field.label + 'ni kiriting...'"
                />
                <p
                  v-if="formErrors[field.name].length"
                  class="text-sm text-destructive"
                >
                  {{ formErrors[field.name][0] }}
                </p>
              </div>

              <!-- IMAGE INPUT -->

              <div v-else-if="field.type === 'image'" class="space-y-1">
                <Label :for="field.name">{{ field.label }}</Label>
                <ImageField
                  :id="field.name"
                  v-model="formData[field.name]"
                  @update:modelValue="(file) => (formData[field.name] = file)"
                />
                <p
                  v-if="formErrors[field.name].length"
                  class="text-sm text-destructive"
                >
                  {{ formErrors[field.name][0] }}
                </p>
              </div>

              <!-- SELECT INPUT -->

              <div v-else-if="field.type === 'select'" class="space-y-1">
                <Label :for="field.name">{{ field.label }}</Label>
                <ForeignField
                  :id="field.name"
                  v-model="formData[field.name]"
                  :options="field.options"
                  :displayValue="(item) => item.name"
                  :placeholder="field.label + 'ni tanlang...'"
                />
                <p
                  v-if="formErrors[field.name].length"
                  class="text-sm text-destructive"
                >
                  {{ formErrors[field.name][0] }}
                </p>
              </div>
            </div>
          </div>

          <!-- LIVE IMAGE EDITOR -->
          <div v-if="formData.image" class="mt-1 space-y-1">
            <span class="block text-sm font-medium"
              >Sertifikat Text Position</span
            >
            <LiveImageEditor
              @update:coordinates="handleCoordinatesUpdate"
              :imageFile="formData.image"
              :initialCoordinates="initialCoordinates"
            />
          </div>
        </div>

        <DialogFooter class="sticky">
          <Button :disabled="isSubmitting" variant="success" type="submit">
            <Icon name="spinner" class="animate-spin" v-if="isSubmitting" />
            {{ editMode ? "Tahrirlash" : "Yaratish" }}
          </Button>
          <Button type="button" variant="secondary" @click="$emit('closed')">
            Bekor qilish
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import api from "@/misc/api";

import ForeignField from "@/components/misc/ForeignField.vue";
import LiveImageEditor from "../misc/LiveImageEditor.vue";
import ImageField from "../misc/ImageField.vue";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";

const emit = defineEmits(["closed", "updated", "created"]);
const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  initialData: Object,
});

const formData = ref({
  name: "",
  image: null,
  type: "oddiy",
  name_coordinates: { x: 165, size: 185, y: 1360 },
  id_coordinates: { x: 2560, size: 100, y: 1930 },
  finished_date_coordinates: { x: 2530, size: 90, y: 2140 },
  qr_code_coordinates: { x: 1505, size: 330, y: 1880 },
});

const formErrors = ref({
  name: [],
  image: [],
  type: [],
  name_coordinates: [],
  id_coordinates: [],
  finished_date_coordinates: [],
  qr_code_coordinates: [],
});

const formFields = ref([
  {
    label: "Nomi",
    name: "name",
    type: "text",
    errors: formErrors.value["name"],
  },
  {
    label: "Turi",
    name: "type",
    type: "select",
    errors: formErrors.value["type"],
    options: [
      { id: "oddiy", name: "Oddiy" },
      { id: "loyiha", name: "Loyiha" },
    ],
  },
  {
    label: "Rasm",
    name: "image",
    type: "image",
    errors: formErrors.value["image"],
  },
]);

const initialCoordinates = computed(() => [
  {
    label: "F.I.O",
    placeholder: "Rustamjanov Shohjahon",
    name: "full_name",
    size: formData.value.name_coordinates.size,
    x: formData.value.name_coordinates.x,
    y: formData.value.name_coordinates.y,
  },
  {
    label: "ID",
    placeholder: "AB12345",
    name: "id",
    size: formData.value.id_coordinates.size,
    x: formData.value.id_coordinates.x,
    y: formData.value.id_coordinates.y,
  },
  {
    label: "Sana",
    placeholder: "01.01.2025",
    name: "finished_date",
    size: formData.value.finished_date_coordinates.size,
    x: formData.value.finished_date_coordinates.x,
    y: formData.value.finished_date_coordinates.y,
  },
  {
    label: "QR Kod",
    name: "qr_code",
    size: formData.value.qr_code_coordinates.size,
    x: formData.value.qr_code_coordinates.x,
    y: formData.value.qr_code_coordinates.y,
  },
]);

const handleCoordinatesUpdate = (coordinates) => {
  formData.value.name_coordinates = coordinates.find(
    (c) => c.name === "full_name",
  );
  formData.value.id_coordinates = coordinates.find((c) => c.name === "id");
  formData.value.finished_date_coordinates = coordinates.find(
    (c) => c.name === "finished_date",
  );
  formData.value.qr_code_coordinates = coordinates.find(
    (c) => c.name === "qr_code",
  );
};

watch(
  () => props.initialData,
  async (newVal) => {
    formData.value = {
      ...formData.value, // Retain default values
      ...newVal, // Override with initial data
    };
  },
  { deep: true, immediate: true },
);

const isSubmitting = ref(false);
const onSubmit = async () => {
  isSubmitting.value = true;

  const submittingData = new FormData();

  submittingData.append("name", formData.value.name);
  submittingData.append("type", formData.value.type);

  const coordinateFields = [
    { key: "name_coordinates", value: formData.value.name_coordinates },
    { key: "id_coordinates", value: formData.value.id_coordinates },
    {
      key: "finished_date_coordinates",
      value: formData.value.finished_date_coordinates,
    },
    { key: "qr_code_coordinates", value: formData.value.qr_code_coordinates },
  ];

  // Append filtered coordinates dynamically
  coordinateFields.forEach(({ key, value }) => {
    const filteredCoordinates = {
      x: value.x,
      y: value.y,
      size: value.size,
      name: value.name,
    };
    submittingData.append(key, JSON.stringify(filteredCoordinates));
  });

  if (!props.editMode || formData.value.image !== props.initialData.image) {
    if (formData.value.image)
      submittingData.append("image", formData.value.image);
  }

  try {
    if (props.editMode) {
      await api.patch(`/courses/${props.initialData.id}/`, submittingData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      emit("updated");
    } else {
      await api.post("/courses/", submittingData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      emit("created");
    }

    emit("closed");
  } catch (error) {
    console.error(error);
    if (error.response && error.response.data) {
      for (const key in error.response.data) {
        if (formErrors.value[key]) {
          formErrors.value[key] = error.response.data[key];
        }
      }
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>
