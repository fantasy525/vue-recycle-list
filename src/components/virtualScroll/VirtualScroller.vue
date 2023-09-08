<template>
  <div
    ref="scrollWrapper"
    class="scrollWrapper"
    :style="{ height: viewPortHeight }"
  >
    <div class="scroller" ref="scroller">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, ref, watchEffect } from "vue";
import useHeightObserve from "../useHeightObserve";
import useScroller from "./useScroller";
const props = defineProps<{
  height?: number;
  onScroll?: (offset: number) => void | Promise<void>;
  onViewportHeightChange?: (height: number) => void;
  onReachBottom?: () => void;
}>();
const scrollWrapper = ref<HTMLDivElement | undefined>();
const scroller = ref<HTMLDivElement | undefined>();
const scrollWrapperHeight = useHeightObserve(
  scrollWrapper,
  "offsetHeight",
  props.height
);
const scrollerMaxHeight = useHeightObserve(scroller, "scrollHeight");

const viewPortHeight = computed(() => {
  if (props.height) {
    return `${props.height}px`;
  }
  return "100%";
});
function animate(y: number) {
  // scrollWrapper.value!.scrollTop = -y;
  scroller.value!.style.transform = `translate3d(0,${y}px,0)`;
}
const onScroll = (offset: number) => {
  if (!props.onScroll) {
    animate(offset);
  } else {
    const result = props.onScroll(offset);
    if (result instanceof Promise) {
      // 等外部更新渲染完UI后再移动位置
      result.then(() => {
        animate(offset);
      });
    } else {
      animate(offset);
    }
  }
};
// 当前设备是移动设备
useScroller(
  scroller,
  scrollWrapper,
  scrollerMaxHeight,
  scrollWrapperHeight,
  onScroll,
  props.onReachBottom
);
watchEffect(() => {
  props.onViewportHeightChange &&
    props.onViewportHeightChange(scrollWrapperHeight.value);
});
</script>
<style scoped lang="scss">
.scrollWrapper {
  overflow: hidden;
  height: 100%;
  position: relative;
  // background-color: aquamarine;
}
.scroller {
  position: absolute;
  /* display:flex是必须的，可以大大减少滚动时HitTest时间 */
  display: flex;
  flex-direction: column;
  will-change: transform;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
}
</style>
