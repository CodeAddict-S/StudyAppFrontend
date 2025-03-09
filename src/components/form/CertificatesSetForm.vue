<template>
  <Dialog :open="isOpen" @update:open="$emit('closed')">
    <DialogContent @interactOutside="$event.preventDefault()">
      <DialogHeader>
        <DialogTitle
          >Sertifikat To'plamini
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

          <!-- DATE INPUT -->

          <div v-else-if="field.type === 'date'" class="space-y-1">
            <Label :for="field.name">{{ field.label }}</Label>
            <DateField
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
        </div>

        <DialogFooter>
          <Button :disabled="isSubmitting" variant="success" type="submit">
            <Icon name="spinner" class="animate-spin" v-if="isSubmitting" />
            {{ editMode ? "Tahrirlash" : "Yaratish" }}
          </Button>
          <Button
            :disabled="isSubmitting"
            @click="$emit('closed')"
            variant="secondary"
          >
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
});

const formData = ref({
  name: "",
  study_center: "",
  finished_date: "",
});

const formErrors = ref({
  name: [],
  finished_date: [],
});

const formFields = ref([
  {
    label: "Nomi",
    name: "name",
    type: "text",
    errors: formErrors.value["name"],
  },
  {
    label: "Bitirgan kuni",
    name: "finished_date",
    type: "date",
    errors: formErrors.value["finished_date"],
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
    certificate_set: route.params.study_center_id,
    contact_number:
      formData.value.contact_number && "998" + formData.value.contact_number,
  };

  try {
    if (props.editMode) {
      await api.patch(
        `/certificate-sets/${props.initialData.id}/`,
        submittingData,
      );
      emit("updated");
    } else {
      await api.post("/certificate-sets/", submittingData);
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
