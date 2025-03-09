<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-2">
      <Input
        disabled
        placeholder="Qidirish..."
        id="search"
        class="h-9 w-full max-w-[50%] truncate pr-9 lg:max-w-[30%]"
      />
      <div class="flex gap-2">
        <Button disabled class="size-9 md:w-max">
          <Icon name="add" />
          <span class="hidden md:block">Yaratish</span>
        </Button>
        <Button disabled class="size-9 md:w-max" variant="success">
          <Icon name="file-excel" />
          <span class="hidden md:block">Excelda chiqarish</span>
        </Button>
      </div>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-for="(_, i) in Array.from({ length: 7 })" :key="i">
            <Skeleton class="h-4 w-14 bg-muted" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(_, i) in Array.from({ length: 10 })" :key="i">
          <TableCell
            :class="index === 6 ? 'text-end' : ''"
            v-for="(_, index) in Array.from({ length: 7 })"
            :key="index"
          >
            <Skeleton v-if="index === 0" class="size-7 rounded-xl bg-accent" />
            <Button
              v-else-if="index === 6"
              size="icon"
              variant="destructive"
              disabled
              class="size-7 rounded-lg"
            >
              <Icon name="trash" />
            </Button>
            <Skeleton v-else class="h-4 w-32 bg-accent" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- <div class="flex items-center justify-end gap-4">
      <Skeleton class="w-8 h-4 md:w-20" />
      <div class="flex items-center gap-2">
        <Skeleton v-for="(_, i) in Array.from({ length: 4 })" :key="i" class="w-8 h-8" />
      </div>
    </div> -->
  </div>
</template>

<script setup>
import Button from "../ui/button/Button.vue";
import Input from "../ui/input/Input.vue";
import Skeleton from "../ui/skeleton/Skeleton.vue";

import {
  Table,
  TableRow,
  TableHead,
  TableHeader,
  TableCell,
  TableBody,
} from "@/components/ui/table";

defineOptions({
  name: "SkeletonTable",
});
</script>
