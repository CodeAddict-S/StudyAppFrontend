<script setup>
import { computed, onMounted, ref, watch } from "vue";
import api from "@/misc/api";

import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxPortal,
  ComboboxRoot,
} from "reka-ui";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  placeholder: String,
  options: [Array, String],
  modelValue: [String, Array],
  displayValue: Function,
});

const selectedOptions = ref([]);
const selectOptions = ref([]);

const open = ref(false);
const searchTerm = ref("");

const deleteItem = (item) =>
  selectedOptions.value.splice(selectedOptions.value.indexOf(item), 1);
const filteredOptions = computed(() =>
  selectOptions.value.filter((i) => !selectedOptions.value.includes(i.name)),
);

watch(
  selectedOptions,
  (newValue) => {
    emit(
      "update:modelValue",
      newValue.map((v) => v.id),
    );
  },
  { deep: true },
);

onMounted(async () => {
  try {
    selectOptions.value =
      typeof props.options === "string"
        ? (await api(props.options)).data
        : props.options;

    selectedOptions.value = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : [];
  } catch (e) {
    console.error("Error fetching options:", e);
  }
});
</script>

<template>
  <TagsInput class="w-full px-0" :model-value="selectedOptions">
    <div
      class="mx-3 mt-1 flex flex-wrap items-center gap-1"
      v-if="selectedOptions.length"
    >
      <TagsInputItem
        v-for="item in selectedOptions"
        :key="item.id"
        :value="item.name || item.username"
      >
        <TagsInputItemText />
        <TagsInputItemDelete @click="deleteItem" />
      </TagsInputItem>
    </div>

    <ComboboxRoot
      v-model="selectedOptions"
      v-model:open="open"
      :search-term="searchTerm"
      class="flex w-full items-center justify-between"
    >
      <ComboboxAnchor as-child>
        <ComboboxInput :placeholder="placeholder" as-child>
          <TagsInputInput
            name="tagsInputInput"
            class="w-full px-3 py-[1.2px]"
          />
        </ComboboxInput>
      </ComboboxAnchor>

      <ComboboxPortal>
        <ComboboxContent>
          <CommandList
            position="popper"
            side="top"
            class="min-w-[--radix-popper-anchor-width] rounded-xl border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          >
            <CommandEmpty />
            <CommandGroup>
              <CommandItem
                class="flex justify-between"
                v-for="option in filteredOptions"
                :key="option.id"
                :value="option"
                @select.prevent="
                  (ev) => {
                    const item = ev.detail.value;

                    if (selectedOptions.includes(item)) {
                      deleteItem(item);
                    } else {
                      searchTerm = '';
                      selectedOptions.push(item);
                    }

                    if (!filteredOptions.length) open = false;
                  }
                "
              >
                <span>{{ option.name }}</span>
                <Check v-if="selectedOptions.includes(option)" class="size-3" />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
  </TagsInput>
</template>

<style scoped>
[data-radix-popper-content-wrapper] {
  z-index: 100 !important;
  top: -12px !important;
}
</style>
