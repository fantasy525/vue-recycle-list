<template>
  <img :src="src" @error="onerror" />
</template>
<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{ src: string; default: string }>();
const error = ref(false);
const src = computed(() => {
  if (!error.value) {
    return props.src;
  }
  return props.default;
});
const onerror = () => {
  error.value = true;
};
</script>
