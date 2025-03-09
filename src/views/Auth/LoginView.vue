<script setup>
import { ref } from "vue";
import api from "@/misc/api";
import router from "@/misc/router";
import { useAuthStore } from "@/misc/store";

import PasswordInput from "@/components/misc/PasswordInput.vue";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const authStore = useAuthStore();

const formError = ref("");
const formData = ref({
  username: "",
  password: "",
});

const isSubmitting = ref(false);
const onSubmit = async () => {
  isSubmitting.value = true;

  try {
    const response = await api.post("/token/", formData.value);
    if (response.status === 200) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      await authStore.fetchUser();
      router.push("/");
    }
  } catch (error) {
    console.error(error);
    formError.value = error.response.data.detail;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen w-full">
    <div class="flex w-full items-center justify-center py-12 lg:w-1/2">
      <div class="flex w-[80%] flex-col items-center gap-6 md:w-[50%] lg:w-1/2">
        <img class="mb-4 w-64" src="/banner.svg" />
        <form class="w-[90%] space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-3">
            <div class="space-y-1">
              <Label for="username">Username</Label>
              <Input
                id="username"
                v-model="formData.username"
                type="text"
                autocomplete="username"
                placeholder="example"
                class="w-full"
                required
              />
            </div>
            <div class="space-y-1">
              <Label for="password">Parol</Label>
              <PasswordInput
                :show-randomizer="false"
                id="password"
                v-model="formData.password"
                type="password"
                required
                autocomplete="new-password"
                placeholder="•••••••••"
              />
            </div>

            <p v-if="formError" class="text-sm text-destructive">
              {{ formError }}
            </p>
          </div>

          <Button :disabled="isSubmitting" type="submit" class="w-full">
            <Icon name="spinner" v-if="isSubmitting" class="animate-spin" />
            Login
          </Button>
        </form>
      </div>
    </div>

    <!-- Image Section -->

    <div class="hidden max-h-screen lg:block lg:w-1/2">
      <img
        src="https://avatars.mds.yandex.net/get-altay/13229524/2a0000018f3312e619f6109f33fc34f09a9b/XXL_height"
        alt="Image"
        width="1920"
        height="1080"
        class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>
