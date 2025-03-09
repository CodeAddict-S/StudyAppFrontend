<template>
  <Dialog :open="isOpen" @update:open="$emit('closed')">
    <DialogContent @interactOutside="$event.preventDefault()">
      <DialogHeader>
        <DialogTitle
          >Managerni {{ editMode ? "Tahrirlash" : "Yaratish" }}</DialogTitle
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
              autocomplete="on"
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

          <!-- PASSWORD INPUT -->

          <div v-else-if="field.type === 'hidden'" class="space-y-1">
            <Label :for="field.name">{{ field.label }}</Label>
            <PasswordInput
              :id="field.name"
              v-model="formData[field.name]"
              autocomplete="on"
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
import api from "@/misc/api";

import PasswordInput from "@/components/misc/PasswordInput.vue";
import PhoneNumberField from "@/components/misc/PhoneNumberField.vue";

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

const emit = defineEmits(["closed", "updated", "created"]);
const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  initialData: Object,
});

const formData = ref({
  username: "",
  first_name: "",
  last_name: "",
  password: "",
  phone_number: "",
});

const formErrors = ref({
  username: [],
  first_name: [],
  last_name: [],
  password: [],
  phone_number: [],
});

const formFields = ref([
  {
    label: "Username",
    name: "username",
    type: "text",
    error: formErrors.value["username"],
  },
  {
    label: "Ism",
    name: "first_name",
    type: "text",
    error: formErrors.value["first_name"],
  },
  {
    label: "Familiya",
    name: "last_name",
    type: "text",
    error: formErrors.value["last_name"],
  },
  {
    label: "Parol",
    name: "password",
    type: "hidden",
    error: formErrors.value["password"],
  },
  {
    label: "Telefon raqam",
    name: "phone_number",
    type: "number",
    error: formErrors.value["phone_number"],
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
    phone_number:
      formData.value.phone_number && "998" + formData.value.phone_number,
  };

  try {
    if (props.editMode) {
      await api.patch(`/users/${props.initialData.id}/`, submittingData);
      emit("updated");
    } else {
      await api.post("/users/", submittingData);
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
