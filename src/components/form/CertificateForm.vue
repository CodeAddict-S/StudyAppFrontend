<template>
  <Dialog :open="isOpen" @update:open="$emit('closed')">
    <DialogContent @interactOutside="$event.preventDefault()">
      <DialogHeader>
        <DialogTitle
          >Sertifikatni {{ editMode ? "Tahrirlash" : "Yaratish" }}</DialogTitle
        >
        <DialogDescription />
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
        <div v-for="field in formFields">
          <!-- NORMAL INPUT -->

          <div v-if="field.type === 'text'" class="space-y-1">
            <Label :for="field.name">{{ field.label }}</Label>
            <Input
              :disabled="readOnly"
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

          <!-- PHONE NUMBER INPUT -->

          <div v-else-if="field.type === 'number'" class="space-y-1">
            <Label :for="field.name">{{ field.label }}</Label>
            <PhoneNumberField
              :disabled="readOnly"
              :id="field.name"
              v-model="formData[field.name]"
              :placeholder="field.label + 'ni kiriting...'"
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

          <!-- DATE INPUT -->

          <div v-else-if="field.type === 'date'" class="space-y-1">
            <Label :for="field.name">{{ field.label }}</Label>
            <DateField
              :disabled="readOnly"
              :id="field.name"
              v-model="formData[field.name]"
              :placeholder="field.label + 'ni kiriting...'"
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

          <!-- SELECT INPUT -->

          <div v-else-if="field.type === 'select'" class="space-y-1">
            <Label :for="field.name">{{ field.label }}</Label>
            <ForeignField
              :disabled="readOnly"
              :id="field.name"
              v-model="formData[field.name]"
              :options="field.options"
              :displayValue="(item) => item.name"
              :placeholder="field.label + 'ni kiriting...'"
            />
            <p
              v-if="formErrors[field.name].length"
              class="text-sm text-destructive"
            >
              {{ formErrors[field.name][0] }}
            </p>
          </div>
        </div>

        <DialogFooter v-if="!readOnly">
          <Button :disabled="isSubmitting" variant="success" type="submit">
            <Icon name="spinner" class="animate-spin" v-if="isSubmitting" />
            {{ editMode ? "Tahrirlash" : "Yaratish" }}
          </Button>
          <Button variant="secondary" @click="$emit('closed')">
            Bekor qilish
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/misc/api";

import PhoneNumberField from "@/components/misc/PhoneNumberField.vue";
import ForeignField from "@/components/misc/ForeignField.vue";
import DateField from "@/components/misc/DateField.vue";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";

const route = useRoute();
const emit = defineEmits(["closed", "updated", "created"]);
const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  initialData: Object,
  readOnly: Boolean,
});

const formData = ref({
  name: "",
  birthdate: "",
  contact_number: "",
  social_status: "",
  course: "",
});

const formErrors = ref({
  name: [],
  birthdate: [],
  contact_number: [],
  social_status: [],
  course: [],
});

const formFields = ref([
  {
    label: "Ism",
    name: "name",
    type: "text",
    errors: formErrors.value["name"],
  },
  {
    label: "Tug'ilgan Sana",
    name: "birthdate",
    type: "date",
    errors: formErrors.value["birthdate"],
  },
  {
    label: "Ijtimoiy Status",
    name: "social_status",
    type: "text",
    errors: formErrors.value["social_status"],
  },
  {
    label: "Telefon raqam",
    name: "contact_number",
    type: "number",
    errors: formErrors.value["contact_number"],
  },
  {
    label: "Kurs",
    name: "course",
    type: "select",
    options: "/courses/",
    errors: formErrors.value["course"],
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
    certificates_set: Number(route.params.study_center_id),
    contact_number: "998" + formData.value.contact_number,
  };

  try {
    if (props.editMode) {
      await api.patch(`/certificates/${props.initialData.id}/`, submittingData);
      emit("updated");
    } else {
      await api.post("/certificates/", submittingData);
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
