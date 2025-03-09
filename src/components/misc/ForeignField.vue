<template>
  <Select :name="id" v-model="selectedValue" :disabled="!selectOptions.length">
    <SelectTrigger>
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent side="bottom">
      <SelectGroup>
        <template v-if="selectOptions.length > 0">
          <SelectItem
            v-for="option in selectOptions"
            :key="option.id"
            :value="String(option.id)"
          >
            {{ displayValue(option) }}
          </SelectItem>
        </template>
        <template v-else>
          <SelectItem disabled value="no-options"> No options </SelectItem>
        </template>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import api from "@/misc/api";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: [String, Number],
  options: [String, Array],
  placeholder: String,
  id: [String, Number],
  displayValue: {
    type: Function,
    default: (option) => option.name,
  },
});

const selectOptions = ref([]);
const selectedValue = ref(null);

watch(
  () => props.options,
  (newOptions) => {
    selectOptions.value = newOptions;
  },
  { immediate: true },
);

watch(selectedValue, (newValue) => {
  emit("update:modelValue", newValue);
});

onMounted(async () => {
  try {
    selectOptions.value =
      typeof props.options === "string"
        ? (await api(props.options)).data
        : props.options;

    if (props.modelValue) selectedValue.value = props.modelValue.toString();
  } catch (e) {
    console.error("Error fetching options:", e);
  }
});
</script>
