import { onMounted, ref, Ref, onBeforeMount } from "vue";

const useHeightObserve = (
  el: Ref<HTMLElement | undefined>,
  prop: "scrollHeight" | "offsetHeight",
  defaultValue?: number
) => {
  const height = ref(
    defaultValue ? defaultValue : el.value ? el.value[prop] : 0
  );
  let ro: ResizeObserver;
  onMounted(() => {
    height.value = el.value![prop];
    ro = new ResizeObserver((enties) => {
      console.log(el.value!.scrollHeight, el.value);
      if (enties.length && el.value) {
        height.value = el.value[prop];
      }
    });
    ro.observe(el.value!);
  });
  onBeforeMount(() => {
    ro?.disconnect();
  });
  return height;
};

export default useHeightObserve;
