<template>
  <Dialog :open="isOpen" @update:open="$emit('closed')">
    <DialogContent @interactOutside="$event.preventDefault()">
      <DialogHeader>
        <DialogTitle
          >O'quv Markazni
          {{ editMode ? "Tahrirlash" : "Yaratish" }}</DialogTitle
        >
        <DialogDescription />
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
        <div v-for="field in formFields">
          <!-- NORMAL INPUT -->

          <div v-if="field.type === 'text'" class="space-y-1">
            <Label :for="field.name">{{ field.label }}</Label>
            <Input
              :id="field.name"
              v-model="formData[field.name]"
              :placeholder="field.label + 'ni kiriting...'"
              :autocomplete="field.name"
            />
            <p
              v-if="field.tip"
              class="text-sm text-muted-foreground"
              v-html="field.tip"
            />
            <p
              v-if="formErrors[field.name].length"
              class="text-sm text-destructive"
            >
              {{ formErrors[field.name][0] }}
            </p>
          </div>

          <!-- PHONE NUMBER INPUT -->

          <div v-else-if="field.type === 'number'" class="space-y-1">
            <Label :for="field.name">{{ field.label }}</Label>
            <PhoneNumberField
              :id="field.name"
              v-model="formData[field.name]"
              :placeholder="field.label + 'ni kiriting...'"
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
              :placeholder="field.label + 'ni tanlang...'"
              :displayValue="(item) => `${item.first_name} ${item.last_name}`"
            />
            <p
              v-if="formErrors[field.name].length"
              class="text-sm text-destructive"
            >
              {{ formErrors[field.name][0] }}
            </p>
          </div>
        </div>

        <DialogFooter>
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
import { ref, watch, onMounted } from "vue";
import api from "@/misc/api";

import ForeignField from "@/components/misc/ForeignField.vue";
import PhoneNumberField from "@/components/misc/PhoneNumberField.vue";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogContent,
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const emit = defineEmits(["closed", "created", "updated"]);
const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  initialData: Object,
});

const formData = ref({
  name: "",
  manager: "",
  contact_number: "",
  location: "",
});

const formErrors = ref({
  name: [],
  manager: [],
  contact_number: [],
  location: [],
});

const formFields = ref([
  {
    name: "name",
    label: "Nomi",
    type: "text",
    error: formErrors.value["name"],
  },
  {
    name: "manager",
    label: "Manager",
    type: "select",
    options: "/users/?is_manager=true",
    error: formErrors.value["manager"],
  },
  {
    name: "contact_number",
    label: "Aloqa Raqami",
    type: "number",
    error: formErrors.value["contact_number"],
  },
  {
    name: "location",
    tip: `Bu yerga <a href="https://maps.google.com/" class="text-blue-500 underline">Google Maps</a> dan URL qoyasiz.`,
    label: "Manzil",
    type: "text",
    error: formErrors.value["location"],
  },
]);

watch(
  () => props.initialData,
  (newVal) => {
    formData.value = { ...newVal };
  },
  { deep: true, immediate: true },
);

const isSubmitting = ref(false);
const onSubmit = async () => {
  isSubmitting.value = true;

  const submittingData = {
    ...formData.value,
    contact_number:
      formData.value.contact_number && "998" + formData.value.contact_number,
  };

  try {
    if (props.editMode) {
      await api.patch(
        `/study-centers/${props.initialData.id}/`,
        submittingData,
      );
      emit("updated");
    } else {
      await api.post("/study-centers/", submittingData);
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
