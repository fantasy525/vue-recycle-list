<template>
  <div
    class="nativeScrollWrapper"
    ref="scrollWrapper"
    :style="{ height: viewPortHeight }"
  >
    <div
      class="scroller"
      ref="scroller"
      :style="{ height: scrollerMaxHeight + 'px' }"
    >
      <div ref="contentWrapper">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watchEffect } from "vue";
import useHeightObserve from "../useHeightObserve";
const props = defineProps<{
  height?: number;
  onScroll?: (offset: number) => void | Promise<void>;
  onViewportHeightChange?: (height: number) => void;
  onReachBottom?: () => void;
}>();
const content = ref<HTMLDivElement | undefined>();
const contentWrapper = ref<HTMLDivElement | undefined>();
const scrollWrapper = ref<HTMLDivElement | undefined>();
const scroller = ref<HTMLDivElement | undefined>();
const scrollWrapperHeight = useHeightObserve(
  scrollWrapper,
  "offsetHeight",
  props.height
);
const scrollerMaxHeight = useHeightObserve(contentWrapper, "scrollHeight");

const viewPortHeight = computed(() => {
  if (props.height) {
    return `${props.height}px`;
  }
  return "100%";
});

const onScroll = () => {
  if (
    scrollWrapper.value!.scrollTop ===
    scrollerMaxHeight.value - scrollWrapperHeight.value
  ) {
    props.onReachBottom && props.onReachBottom();
  }
  props.onScroll && props.onScroll(scrollWrapper.value!.scrollTop);
};
onMounted(() => {
  scrollWrapper.value?.addEventListener("scroll", onScroll, { passive: true });
});

watchEffect(() => {
  props.onViewportHeightChange &&
    props.onViewportHeightChange(scrollWrapperHeight.value);
});
</script>
<style scoped lang="scss">
.nativeScroller {
  overflow: hidden;
}
.nativeScrollWrapper {
  overflow: auto;
}
.scroller {
  position: relative;
  /* display:flex是必须的，可以大大减少滚动时HitTest时间 */
  display: flex;
  flex-direction: column;
  will-change: transform;
}
.content {
  height: 100%;
  overflow: hidden;
}
</style>
