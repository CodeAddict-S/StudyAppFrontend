<template>
  <div class="flex flex-col gap-1">
    <input
      :id="id"
      type="text"
      v-model="formattedDate"
      @focus="showCalendar = true"
      readonly
      hidden
    />
    <Popover>
      <PopoverTrigger as-child>
        <Button
          :disabled="disabled"
          variant="outline"
          class="w-full rounded-xl ps-3 text-start font-medium"
        >
          <span v-if="selectedDate">{{ formattedDate }}</span>
          <span v-else class="text-muted-foreground">{{ placeholder }}</span>
          <Icon name="calendar" size="md" class="ms-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" class="w-auto p-0">
        <Calendar
          v-model="selectedDate"
          calendar-label="date-picker"
          initial-focus
          :min-value="new CalendarDate(1950, 1, 1)"
          :max-value="today(getLocalTimeZone())"
        />
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  today,
  parseDate,
} from "@internationalized/date";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: [Object, String],
    default: null,
  },
  placeholder: {
    type: String,
    default: "Select a date",
  },
  id: {
    type: String,
    default: "date-field",
  },
  disabled: Boolean,
});

const showCalendar = ref(false);
const selectedDate = ref(null);

const df = new DateFormatter("en-US", { dateStyle: "long" });

const formattedDate = computed(() => {
  return selectedDate.value
    ? df.format(
        new Date(
          selectedDate.value.year,
          selectedDate.value.month - 1,
          selectedDate.value.day,
        ),
      )
    : "";
});

watch(
  () => props.modelValue,
  (newValue) => {
    selectedDate.value = newValue ? parseDate(newValue) : null;
  },
  { immediate: true },
);

watch(selectedDate, (newDate) => {
  if (newDate) {
    const formattedDate = `${newDate.year}-${String(newDate.month).padStart(2, "0")}-${String(newDate.day).padStart(2, "0")}`;
    if (formattedDate !== props.modelValue)
      emit("update:modelValue", formattedDate);
  } else {
    if (props.modelValue !== null) {
      emit("update:modelValue", null);
    }
  }
});
</script>
