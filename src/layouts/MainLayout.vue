<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/misc/store";
import { textFormatter } from "@/misc/utils";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const route = useRoute();
const authStore = useAuthStore();

const pageName = ref("Admin Panel");
const sidebarItems = [
  {
    name: "O'quv Markaz",
    url: "study-center",
    icon: "school",
    access: ["admin"],
  },
  {
    name: "Manager",
    url: "manager",
    icon: "user-gear",
    access: ["admin"],
  },
  {
    name: "Kurs",
    url: "courses",
    icon: "lesson",
    access: ["admin"],
  },
  {
    name: "Sertifikat",
    url: "certificate-sets",
    icon: "diploma",
    access: ["admin", "manager"],
  },
  {
    name: "Statistika",
    url: "statistics",
    icon: "dashboard-monitor",
    access: ["admin", "manager"],
  },
  {
    name: "Baza",
    url: "base",
    icon: "database",
    access: ["admin"],
  },
];

const filteredSidebarItems = computed(() => {
  return authStore.user
    ? sidebarItems.filter((item) =>
        item.access.some((role) => authStore.user.roles.includes(role)),
      )
    : [];
});

watch(
  () => route.name,
  () => {
    pageName.value = route.meta.label;
  },
  { immediate: true },
);

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
});
</script>

<template>
  <SidebarProvider>
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader class="p-0">
        <router-link to="/" class="my-2 flex items-center justify-center">
          <img
            src="/banner.svg"
            class="m-6 h-14 w-auto transition-all duration-300 group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:scale-95 group-data-[collapsible=icon]:opacity-0"
          />
          <img
            src="/logo.svg"
            class="ml-[7px] hidden size-6 transition-all duration-300 group-data-[collapsible=icon]:block group-data-[collapsible=icon]:scale-100 group-data-[collapsible=icon]:opacity-100"
          />
        </router-link>
      </SidebarHeader>
      <SidebarContent class="group-data-[collapsible=icon]:w-min">
        <SidebarGroup class="p-0">
          <SidebarMenu class="gap-1">
            <router-link
              v-for="item in filteredSidebarItems"
              class="group-data-[collapsible=icon]:w-min"
              v-slot="{ isActive }"
              :to="{ name: item.url }"
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  :tooltip="item.name"
                  as-child
                  :isActive="isActive"
                  class="rounded-l-none border-l duration-150 hover:border-black/50 group-data-[collapsible=icon]:border-none [&>svg]:size-5"
                  :class="
                    isActive || item.url.includes(route.name.substring(0, 5))
                      ? 'border-primary font-semibold text-primary/80 [&>svg]:hover:stroke-[2.3px]'
                      : ''
                  "
                >
                  <a
                    :href="item.url"
                    class="h-full text-sm group-data-[collapsible=icon]:w-min"
                  >
                    <Icon
                      :name="item.icon.toString()"
                      size="xl"
                      :variant="
                        isActive ||
                        item.url.includes(route.name.substring(0, 5))
                          ? 'sr'
                          : 'rr'
                      "
                    />
                    <p class="group-data-[collapsible=icon]:hidden">
                      {{ item.name }}
                    </p>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </router-link>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem class="flex gap-2">
            <Avatar
              class="h-9 w-9 rounded-lg border border-muted-foreground/30"
            >
              <Icon class="text-muted-foreground" name="user" variant="sr" />
            </Avatar>
            <div
              class="grid text-left text-sm leading-tight group-data-[collapsible=icon]:hidden"
            >
              <span class="truncate font-semibold"
                >{{ authStore.user?.first_name }}
                {{ authStore.user?.last_name }}</span
              >
              <span class="truncate text-xs">{{
                authStore.user?.roles
                  .map((role) => textFormatter(role))
                  .join(", ")
              }}</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset class="relative overflow-x-auto">
      <header
        class="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear"
      >
        <div class="flex items-center gap-2">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <span v-if="route.name !== 'certificates'" class="text-base">{{
            pageName
          }}</span>
          <div v-else class="flex justify-center gap-2">
            <router-link to="/certificates">
              <span class="text-base text-primary hover:underline"
                >Sertifikatlar To'plami</span
              >
            </router-link>
            <Icon name="angle-small-right" />
            <span>Sertifikatlar</span>
          </div>
        </div>
        <div>
          <router-link :to="{ name: 'login' }">
            <Button v-if="!authStore.isAuthenticated">
              <Icon name="enter" />
              <span>Login</span>
            </Button>
            <Button v-else variant="destructive" @click="authStore.logout">
              <Icon name="leave" />
              <span>Logout</span>
            </Button>
          </router-link>
        </div>
      </header>
      <div class="m-4 flex h-full flex-col">
        <router-view ref="current_view" />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
