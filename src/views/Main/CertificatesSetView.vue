<template>
  <SkeletonTable v-if="isLoading" />

  <div v-else class="h-full w-full">
    <!-- TOOLBAR -->

    <div class="mb-4 flex items-center justify-between gap-4">
      <div class="relative flex w-full max-w-[50%] items-center lg:max-w-[30%]">
        <Input v-model="searchQuery" placeholder="To'plam Qidirish..." id="search" class="h-9 truncate pr-8" />
        <button v-if="searchQuery" @click="clearSearch"
          class="absolute right-2 flex size-5 items-center justify-center rounded-xl p-1" variant="secondary">
          <Icon name="cross-circle" />
        </button>
      </div>
      <div class="flex gap-2">
        <Button v-if="user.is_manager" class="size-9 md:w-max" @click="openForm">
          <Icon name="add" />
          <span class="hidden md:block">Yaratish</span>
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

            <span v-if="column.key === 'order'" class="pl-2">{{
              rowIndex + 1
              }}</span>

            <!-- EDIT FORM TRIGGER -->

            <router-link v-else-if="column.key === 'name'" :to="{
              name: 'certificates',
              params: { study_center_id: row.id },
            }">
              <Button class="h-7 w-auto px-3 disabled:bg-accent" variant="secondary">
                {{ row[column.key] }}
              </Button>
            </router-link>

            <!-- TYPE COLUMN -->

            <Badge v-else-if="column.key === 'type'" variant="outline">
              {{ textFormatter(row[column.key]) }}
            </Badge>

            <!-- FINISHED DATE COLUMN -->

            <span v-else-if="column.key === 'finished_date'">
              {{ dateFormatter(row[column.key]) }}
            </span>

            <!-- STATUS COLUMN -->

            <Badge v-else-if="column.key === 'status'" class="space-x-1" variant="outline">
              <Icon size="xs" :name="statusMap[row[column.key]].icon" />
              <span>{{ textFormatter(statusMap[row[column.key]].label) }}</span>
            </Badge>

            <!-- STATUS CHANGE TRIGGER -->

            <div v-else-if="column.key === 'actions'">
              <div v-if="['draft', 'canceled'].includes(row.status)" class="space-x-1">
                <Button size="xs" variant="success" @click="openStatusDialog(row, 'pending')">
                  <Check />
                </Button>
                <Button v-if="!isAdmin" size="xs" variant="success" @click="openEditForm(row)">
                  <PencilLine />
                </Button>
                <Button v-if="!isAdmin" size="xs" variant="destructive" @click="openDeleteDialog(row)">
                  <Icon name="trash" />
                </Button>
              </div>
              <div v-else-if="row.status === 'pending'" class="space-x-1">
                <Button size="xs" variant="success" :disabled="row.status === 'pending' && !isAdmin"
                  @click="openStatusDialog(row, 'completed')">
                  <Check />
                </Button>
                <Button size="xs" variant="destructive" :disabled="row.status === 'pending' && !isAdmin"
                  @click="openStatusDialog(row, 'canceled')">
                  <X />
                </Button>
              </div>
              <Button v-else-if="row.status === 'completed'" @click="handleSetDownload(row.id)" size="xs"
                variant="success" :disabled="(row.status === 'pending' && !isAdmin) || isSetDownloading">
                <Icon :name="isSetDownloading ? 'loading' : 'file-download'"
                  :class="{ 'animate-spin': isSetDownloading }" />
              </Button>
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

    <CertificatesSetForm v-if="isFormDialogOpen" :isOpen="isFormDialogOpen" :editMode="!!selectedItem"
      :initialData="selectedItem" @closed="closeDialog" @created="handleCreate" @updated="handleUpdate" />

    <!-- DELETE DIALOG -->

    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sertifikat To'plamini O'chirish</DialogTitle>
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

    <!-- CHANGE STATUS DIALOG -->

    <Dialog v-model:open="isStatusDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Statusni O'zgartirish</DialogTitle>
          <DialogDescription>
            Bu amalni ortga qaytarib bo'lmaydi, ishonchingiz komilmi?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="confirmStatusChange" :disabled="isChangingStatus" variant="success" type="submit">
            {{ isChangingStatus ? "O'zgartirilmoqda..." : "O'zgartirish" }}
          </Button>
          <Button @click="closeDialog" :disabled="isChangingStatus" variant="secondary">Bekor qilish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Check, PencilLine, X } from "lucide-vue-next";
import { dateFormatter, textFormatter } from "@/misc/utils";
import api from "@/misc/api";

import SkeletonTable from "@/components/misc/SkeletonTable.vue";
import NotProvided from "@/components/misc/NotProvided.vue";
import CertificatesSetForm from "@/components/form/CertificatesSetForm.vue";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const user = JSON.parse(localStorage.getItem("user"));
const isAdmin = user.roles.includes("admin");

const isLoading = ref(true);
const rows = ref([]);
const columns = ref([
  { key: "order", title: "№" },
  { key: "name", title: "Nomi" },
  { key: "study_center", title: "O'quv Markaz" },
  { key: "finished_date", title: "Bitirgan Sanasi" },
  { key: "status", title: "Status" },
  { key: "actions", title: "" },
]);

const fetchCertificateSets = async () => {
  const { data } = await api(
    `/certificate-sets/?displayStudyCenter=true&displayStatus=pending,canceled${isAdmin ? "" : ",draft,completed"}`,
  );
  rows.value = data.map((d) => ({
    ...d,
    study_center: d.study_center.name,
  }));
};

const fetchCertificatesSet = async (id) =>
  (await api(`/certificate-sets/${id}/`)).data;

const statusMap = ref({
  draft: {
    label: "Qoralama",
    icon: "file-edit",
  },
  pending: {
    label: "Kutilmoqda",
    icon: "time-quarter-to",
  },
  completed: {
    label: "Tugatildi",
    icon: "check-circle",
  },
  canceled: {
    label: "Qaytarildi",
    icon: "cross-circle",
  },
});

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

const downloadingSetId = ref(null);
const isSetDownloading = ref(false);

const handleSetDownload = async (id) => {
  downloadingSetId.value = id;
  isSetDownloading.value = true;

  try {
    const response = await api(`/certificate-sets/${id}/generate_zip/`, { responseType: "blob" });
    if (!response.status === 200)
      throw new Error("Failed to download : " + response.statusText);

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    const setName = rows.value.find(r => r.id === downloadingSetId.value).name
    link.setAttribute("download", `${setName}.zip`);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
  } finally {
    downloadingSetId.value = null;
    isSetDownloading.value = false;
  }
};

/*                               */
/*          STATUS CHANGER       */
/*                               */

const isStatusDialogOpen = ref(false);
const itemToChangeStatus = ref(null);
const selectedStatus = ref(null);
const isFormLoading = ref(false);
const isChangingStatus = ref(false);

const changeStatus = async (itemId, newStatus) => {
  try {
    await api.patch(`/certificate-sets/${itemId}/`, { status: newStatus });
    fetchCertificateSets();
  } catch (error) {
    console.error(error);
  }
};

const openStatusDialog = (row, status) => {
  itemToChangeStatus.value = row;
  isStatusDialogOpen.value = true;
  selectedStatus.value = status;
};

const openEditForm = async (set) => {
  isFormLoading.value = true;
  loadingItemId.value = set.id;
  selectedItem.value = await fetchCertificatesSet(set.id);
  isFormLoading.value = false;
  loadingItemId.value = null;
  isFormDialogOpen.value = true;
};

const confirmStatusChange = async () => {
  if (itemToChangeStatus.value) {
    isChangingStatus.value = true;

    try {
      await changeStatus(itemToChangeStatus.value.id, selectedStatus.value);
      closeDialog();
    } catch (error) {
      console.error(error);
    } finally {
      isChangingStatus.value = false;
    }
  }
};

/*                               */
/*        CREATE/EDIT FORM       */
/*                               */

const loadingItemId = ref(null);
const isFormDialogOpen = ref(false);
const selectedItem = ref(null);

const openForm = () => {
  selectedItem.value = null;
  isFormDialogOpen.value = true;
};

const handleCreate = () => {
  fetchCertificateSets();
  closeDialog();
};

const handleUpdate = () => {
  fetchCertificateSets();
  closeDialog();
};

const closeDialog = () => {
  isFormDialogOpen.value = false;
  loadingItemId.value = null;
  isStatusDialogOpen.value = false;
  itemToChangeStatus.value = null;
  selectedItem.value = null;
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
      await api.delete(`/certificate-sets/${itemToDelete.value.id}/`);
      await fetchCertificateSets();
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
  await fetchCertificateSets();
  isLoading.value = false;
});
</script>
