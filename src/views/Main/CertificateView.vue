<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { convertUrlToFile, dateFormatter } from "@/misc/utils";
import api from "@/misc/api";
import QRCode from "qrcode";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const route = useRoute();
const router = useRouter();
const isAuthenticated = localStorage.getItem("isAuthenticated");

const data = ref(null);
const imageFile = ref(null);
const canvas = ref(null);
const ctx = ref(null);
const texts = ref([]);

const generateQRCode = async (text, size) =>
  QRCode.toDataURL(text, { width: size });

const loadImage = () => {
  if (!imageFile.value) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = URL.createObjectURL(imageFile.value);
    img.onload = async () => {
      const canvasEl = canvas.value;
      ctx.value = canvasEl.getContext("2d");

      canvasEl.width = img.width;
      canvasEl.height = img.height;

      // DRAW THE IMAGE ON THE CANVAS

      ctx.value.drawImage(img, 0, 0, img.width, img.height);

      // DRAW TEXTS AND QR CODE

      await document.fonts.load("16px Montserrat");
      await document.fonts.ready;
      drawTexts();
    };
  };
  reader.readAsDataURL(imageFile.value);
};

const drawTexts = async () => {
  if (!ctx.value) return;

  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

  const img = new Image();
  img.src = URL.createObjectURL(imageFile.value);
  img.onload = () => {
    ctx.value.drawImage(img, 0, 0, img.width, img.height);

    texts.value.forEach((text) => {
      // RENDER FULL NAME

      if (text.name === "full_name") {
        ctx.value.font = `${text.size}px Montserrat, Inter`;
        ctx.value.fillStyle = "black";
        ctx.value.strokeStyle = "black";
        ctx.value.textBaseline = "top";
        ctx.value.lineWidth = 2;
        ctx.value.strokeText(data.value["name"], text.x, text.y);
        ctx.value.fillText(data.value["name"], text.x, text.y);
      }

      // RENDER ID
      else if (text.name === "id") {
        ctx.value.font = `${text.size}px Montserrat, Inter`;
        ctx.value.fillStyle = "black";
        ctx.value.strokeStyle = "black";
        ctx.value.textBaseline = "top";
        ctx.value.lineWidth = 2;
        ctx.value.strokeText(data.value["UUID"], text.x, text.y);
        ctx.value.fillText(data.value["UUID"], text.x, text.y);
      }

      // RENDER FINISHED DATE
      else if (text.name === "finished_date") {
        ctx.value.font = `${text.size}px Montserrat, Inter`;
        ctx.value.fillStyle = "black";
        ctx.value.strokeStyle = "black";
        ctx.value.textBaseline = "top";
        ctx.value.lineWidth = 2;
        ctx.value.strokeText(
          dateFormatter(data.value.certificates_set["finished_date"]),
          text.x,
          text.y,
        );
        ctx.value.fillText(
          dateFormatter(data.value.certificates_set["finished_date"]),
          text.x,
          text.y,
        );
      }

      // RENDER QR CODE
      else if (text.name === "qr_code") {
        generateQRCode(
          import.meta.env.VITE_FRONTEND_URL + '/certificate/' + data.value.UUID,
          text.size,
        ).then((qrCodeUrl) => {
          if (qrCodeUrl) {
            const qrCodeImg = new Image();
            qrCodeImg.src = qrCodeUrl;
            qrCodeImg.onload = () => {
              ctx.value.drawImage(
                qrCodeImg,
                text.x,
                text.y,
                text.size,
                text.size,
              );
            };
          }
        });
      }
    });
  };
};

const downloadCertificate = async () => {
  try {
    const canvasEl = canvas.value;
    const dataUrl = canvasEl.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${data.value.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download certificate:", error);
    alert("Failed to download certificate. Please try again.");
  }
};

const goBack = async () => router.push("/");

onMounted(async () => {
  try {
    const certificateUUID = route.path.split("/")[2];
    const response = await api.get(`/get-certificate/${certificateUUID}/`, {
      headers: { Authorization: "" },
    });
    data.value = response.data;
    imageFile.value = await convertUrlToFile(
      import.meta.env.VITE_BACKEND_URL + data.value.course.image,
      "image.png",
    );
    texts.value = [
      response.data.course.name_coordinates,
      response.data.course.id_coordinates,
      response.data.course.finished_date_coordinates,
      response.data.course.qr_code_coordinates,
    ];
    loadImage();
  } catch (e) {
    console.error(e);
    if (e.response.status === 404) router.push({ name: "not-found" });
  }
});
</script>

<template>
  <div class="container mx-auto flex min-h-dvh items-center justify-center p-6">
    <!-- SKELETON CERTIFICATE -->

    <Card v-if="!data" class="w-full max-w-2xl rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <CardHeader class="space-y-4">
        <!-- CERTIFICATE IMAGE -->

        <Skeleton class="min-h-80 w-full rounded-2xl object-cover" />

        <!-- CERTIFICATE TITLE AND BADGE -->

        <div class="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <CardTitle class="flex gap-2 text-3xl font-bold">
            <Skeleton class="h-9 w-80" />
            <Skeleton class="h-9 w-32" />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent class="flex flex-wrap justify-between gap-4">
        <!-- CERTIFICATE DETAILS LIST -->

        <ul class="space-y-4 truncate">
          <li class="flex flex-col gap-1">
            <span class="flex gap-1.5 text-sm text-muted-foreground">
              <Icon name="cake-birthday" />
              <p class="truncate">Tug'ilgan Sana</p>
            </span>
            <Skeleton class="h-7 max-w-32" />
          </li>
          <li class="flex flex-col gap-1">
            <span class="flex gap-1.5 text-sm text-muted-foreground">
              <Icon name="phone-call" />
              <p class="truncate">Telefon Raqami</p>
            </span>
            <Skeleton class="h-7 max-w-32" />
          </li>
          <li class="flex flex-col gap-1">
            <span class="flex gap-1.5 text-sm text-muted-foreground">
              <Icon name="e-learning" />
              <p class="truncate">Kurs</p>
            </span>
            <Skeleton class="h-7 max-w-32" />
          </li>
        </ul>
        <ul class="space-y-4 truncate">
          <li class="flex flex-col gap-1">
            <span class="flex gap-1.5 text-sm text-muted-foreground">
              <Icon name="hourglass-end" />
              <p class="truncate">Bitirgan Sana</p>
            </span>
            <Skeleton class="h-7 max-w-32" />
          </li>
          <li class="flex flex-col gap-1">
            <span class="flex gap-1.5 text-sm text-muted-foreground">
              <Icon name="calendar" />
              <p class="truncate">O'quv Markaz</p>
            </span>
            <Skeleton class="h-7 max-w-32" />
          </li>
        </ul>
      </CardContent>
      <CardFooter class="flex flex-col justify-end gap-2 md:flex-row">
        <!-- RETURN BUTTON -->

        <Button v-if="isAuthenticated" class="w-full md:w-auto" @click="goBack" variant="secondary">
          <Icon name="arrow-left" />
          <span class="truncate">Orqaga Qaytish</span>
        </Button>

        <!-- DOWNLOAD BUTTON -->

        <Button class="w-full md:w-auto" @click="downloadCertificate">
          <Icon name="file-download" />
          <span class="truncate">Yuklab Olish</span>
        </Button>
      </CardFooter>
    </Card>

    <!-- CERTIFICATE DETAILS -->

    <Card v-else class="w-full max-w-2xl rounded-2xl border-primary transition-shadow duration-300">
      <CardHeader class="space-y-4">

        <!-- CERTIFICATE IMAGE -->

        <canvas ref="canvas" class="w-full rounded-2xl border object-cover"></canvas>

        <!-- CERTIFICATE TITLE AND BADGE -->

        <div class="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <CardTitle class="break-all flex gap-2 items-center text-3xl font-bold">
            <span>
              {{ data.name }}
            </span>
            <Badge class="text-sm" v-if="data.social_status">
              {{ data.social_status }}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent class="flex flex-wrap justify-between gap-4">

        <!-- CERTIFICATE DETAILS LIST -->

        <ul class="space-y-4 truncate">
          <li class="flex flex-col gap-1">
            <span class="flex gap-1.5 truncate text-sm text-muted-foreground">
              <Icon name="cake-birthday" />
              <p>Tug'ilgan Sana</p>
            </span>
            <span class="truncate text-lg font-medium text-accent-foreground">
              {{ dateFormatter(data.birthdate) }}
            </span>
          </li>
          <li class="flex flex-col gap-1">
            <span class="flex gap-1.5 truncate text-sm text-muted-foreground">
              <Icon name="phone-call" />
              <p>Telefon Raqami</p>
            </span>
            <span class="truncate text-lg font-medium text-accent-foreground">
              +{{ data.contact_number }}
            </span>
          </li>
          <li class="flex flex-col gap-1">
            <span class="flex gap-1.5 truncate text-sm text-muted-foreground">
              <Icon name="e-learning" />
              <p>Kurs</p>
            </span>
            <span class="truncate text-lg font-medium text-accent-foreground">
              {{ data.course.name }}
            </span>
          </li>
        </ul>
        <ul class="mr-4 space-y-4 truncate">
          <li class="flex flex-col gap-1">
            <span class="flex gap-1.5 text-sm text-muted-foreground">
              <Icon name="hourglass-end" />
              <p>Bitirgan Sana</p>
            </span>
            <span class="truncate text-lg font-medium text-accent-foreground">
              {{ dateFormatter(data.certificates_set.finished_date) }}
            </span>
          </li>
          <li class="flex flex-col gap-1">
            <span class="flex gap-1.5 truncate text-sm text-muted-foreground">
              <Icon name="school" />
              <p>O'quv Markaz</p>
            </span>
            <span class="truncate text-lg font-medium text-accent-foreground">
              {{ data.study_center }}
            </span>
          </li>
        </ul>
      </CardContent>
      <CardFooter class="flex flex-col justify-end gap-2 md:flex-row">
        <!-- RETURN BUTTON -->

        <Button v-if="isAuthenticated" class="w-full md:w-auto" @click="goBack" variant="secondary">
          <Icon name="arrow-left" />
          <span class="truncate">Orqaga Qaytish</span>
        </Button>

        <!-- DOWNLOAD BUTTON -->

        <Button @click="downloadCertificate" class="w-full md:w-auto">
          <Icon name="file-download" />
          <span class="truncate">Yuklab Olish</span>
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
