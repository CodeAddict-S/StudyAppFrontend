<template>
  <SkeletonTable v-if="isLoading" />

  <div v-else class="h-full w-full">
    <!-- TOOLBAR -->

    <div class="mb-4 flex items-center justify-between gap-4">
      <div class="relative flex w-full max-w-[50%] items-center lg:max-w-[30%]">
        <Input v-model="searchQuery" :placeholder="'Sertifikat Qidirish...'" id="search" class="h-9 truncate pr-8" />
        <button v-if="searchQuery" @click="clearSearch"
          class="absolute right-2 flex size-5 items-center justify-center rounded-xl p-1" variant="secondary">
          <Icon name="cross-circle" />
        </button>
      </div>
      <div class="flex gap-2">
        <Button v-if="
          user.is_manager &&
          !['completed', 'pending'].includes(currentCertificateSet.status)
        " class="size-9 md:w-max" @click="openForm">
          <Icon name="add" />
          <span class="hidden md:block">Yaratish</span>
        </Button>
        <Button class="size-9 md:w-max" variant="success">
          <Icon name="file-excel" />
          <span class="hidden md:block">Excelda chiqarish</span>
        </Button>
      </div>
    </div>

    <!-- TABLE -->

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-for="column in columns" class="truncate" :class="{ 'pl-4 font-sans': column.key === 'order' }">
            {{ column.title }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(row, rowIndex) in filteredRows">
          <TableCell v-for="column in columns" class="truncate">
            <!-- ORDER COLUMN -->

            <span v-if="column.key === 'order'" class="pl-2">
              {{ rowIndex + 1 }}
            </span>

            <!-- EDIT FORM TRIGGER -->

            <Button v-else-if="column.key === 'name'" @click="openEditForm(row)" :disabled="isFormLoading"
              class="h-7 w-auto px-3 disabled:bg-accent" variant="secondary">
              <span v-if="loadingItemId !== row.id">{{ row[column.key] }}</span>
              <Icon name="spinner" v-else class="size-4 animate-spin" />
            </Button>

            <!-- GENDER COLUMN -->

            <Badge v-else-if="column.key === 'gender'" variant="outline" class="space-x-1">
              {{ textFormatter(genderMap[row[column.key]]) }}
            </Badge>

            <!-- DELETE FORM TRIGGER -->

            <div v-else-if="column.key === 'actions'">
              <Button v-if="currentCertificateSet.status !== 'completed'" size="xs" :disabled="user.is_staff || currentCertificateSet.status === 'pending'
                " variant="destructive" @click="openDeleteDialog(row)">
                <Icon name="trash" />
              </Button>

              <router-link :to="{
                name: 'certificate',
                params: { certificate_uuid: row.UUID },
              }" v-else>
                <Button size="xs">
                  <Icon name="eye" />
                </Button>
              </router-link>
            </div>

            <!-- OTHER COLUMNS -->

            <span v-else-if="!['-', null, undefined, ''].includes(row[column.key])">
              {{ textFormatter(row[column.key]) }}
            </span>

            <!-- NON-PROVIDED FIELD -->

            <NotProvided v-else />
          </TableCell>
        </TableRow>
        <TableRow v-if="!filteredRows.length">
          <TableCell :colspan="columns.length" class="h-24 text-center">
            No results
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- FORM DIALOG -->

    <CertificateForm v-if="isFormDialogOpen" :readOnly="user.is_staff ||
      ['completed', 'pending'].includes(currentCertificateSet.status)
      " :isOpen="isFormDialogOpen" :editMode="!!selectedItem" :initialData="selectedItem" @closed="closeForm"
      @created="handleCreate" @updated="handleUpdate" />

    <!-- DELETE DIALOG -->

    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sertifikatni O'chirish</DialogTitle>
          <DialogDescription>
            Bu amalni ortga qaytarib bo'lmaydi, ishonchingiz komilmi?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="confirmDelete" :disabled="isDeleting" variant="destructive" type="submit">
            {{ isDeleting ? "O'chirilmoqda...." : "O'chirish" }}
          </Button>
          <Button @click="closeForm" :disabled="isDeleting" variant="secondary">Bekor qilish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { textFormatter } from "@/misc/utils";
import api from "@/misc/api";

import CertificateForm from "@/components/form/CertificateForm.vue";
import SkeletonTable from "@/components/misc/SkeletonTable.vue";
import NotProvided from "@/components/misc/NotProvided.vue";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const isLoading = ref(true);
const rows = ref([]);
const columns = ref([
  { key: "order", title: "№" },
  { key: "name", title: "Ism" },
  { key: "course", title: "Kurs" },
  { key: "social_status", title: "Ijtimoiy Status" },
  { key: "contact_number", title: "Telefon" },
  { key: "actions", title: "" },
]);

const route = useRoute();
const user = JSON.parse(localStorage.getItem("user"));
const certificateSetId = ref(route.params.study_center_id);
const currentCertificateSet = ref({});

const fetchCertificates = async () => {
  const { data } = await api(
    `/certificates/?certificates_set=${certificateSetId.value}&displayCourse=true`,
  );

  rows.value = data.map((d) => ({
    ...d,
    contact_number: d.contact_number ? "+" + d.contact_number : null,
    social_status: d.social_status || null,
    course: d.course?.name || null,
  }));
};
const fetchCertificate = async (id) => {
  const { data } = await api.get(`/certificates/${id}/`);
  return {
    ...data,
    contact_number: data.contact_number && data.contact_number.substring(3),
  };
};

const fetchCertificateSet = async () => {
  currentCertificateSet.value = (
    await api(`/certificate-sets/${certificateSetId.value}/`)
  ).data;
};

/*                               */
/*            TOOLBAR            */
/*                               */

const searchQuery = ref("");
const clearSearch = () => (searchQuery.value = "");

const filteredRows = computed(() => {
  return rows.value.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

/*                               */
/*        CREATE/EDIT FORM       */
/*                               */

const isFormLoading = ref(false);
const loadingItemId = ref(null);
const isFormDialogOpen = ref(false);
const selectedItem = ref(null);

const openForm = () => {
  selectedItem.value = null;
  isFormDialogOpen.value = true;
};

const openEditForm = async (certificate) => {
  isFormLoading.value = true;
  loadingItemId.value = certificate.id;
  selectedItem.value = await fetchCertificate(certificate.id);
  loadingItemId.value = null;
  isFormLoading.value = false;
  isFormDialogOpen.value = true;
};

const handleCreate = () => {
  fetchCertificates();
  closeForm();
};

const handleUpdate = () => {
  fetchCertificates();
  closeForm();
};

/*                               */
/*          DELETE DIALOG        */
/*                               */

const isDeleteDialogOpen = ref(false);
const itemToDelete = ref(null);
const isDeleting = ref(false);

const openDeleteDialog = (row) => {
  itemToDelete.value = row;
  isDeleteDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (itemToDelete.value) {
    isDeleting.value = true;

    try {
      await api.delete(`/certificates/${itemToDelete.value.id}/`);
      await fetchCertificates();
      closeForm();
    } catch (error) {
      console.error(error);
    } finally {
      isDeleting.value = false;
    }
  }
};

const closeForm = () => {
  isFormDialogOpen.value = false;
  isDeleteDialogOpen.value = false;
  loadingItemId.value = null;
  itemToDelete.value = null;
  selectedItem.value = null;
};

/*                                  */
/*              SET UP              */
/*                                  */

onMounted(async () => {
  await fetchCertificateSet();
  await fetchCertificates();
  isLoading.value = false;
});
</script>
