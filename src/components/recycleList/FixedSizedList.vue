<template>
  <component
    :is="scrollComponent"
    :on-scroll="onScroll"
    :on-viewport-height-change="onViewportHeightChange"
  >
    <div class="recycle-list">
      <div
        class="heightHolder"
        :style="{
          height: props.dataList.length * itemHeight + 'px',
        }"
      >
        <div
          class="item"
          ref="views"
          :style="{
            height: itemHeight + 'px',
            marginBottom: '10px',
          }"
          v-for="(item, index) in visibleList"
          :key="index"
          :data-key="index"
        >
          <slot :item="item"></slot>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import NativelScroll from "../nativeScroll/index.vue";
import VirtualScroller from "../virtualScroll/VirtualScroller.vue";
import useItem from "../useItem";
const props = defineProps<{
  dataList: Array<any>;
  onUpdateNode?: (item: { x: number; y: number; dataIndex: number }) => void;
}>();
const { updateItem } = useItem();
const views = ref<HTMLDivElement[]>();
const itemHeight = ref(249);
let scrollTop = 0;
let scrollDirection: "down" | "up" = "down";
let hasMeasureHeight = false;
const useNativeScroll = false;
const scrollComponent = { NativelScroll, VirtualScroller }[
  useNativeScroll ? "NativelScroll" : "VirtualScroller"
];
const viewPortHeight = ref(0);
const onViewportHeightChange = (height: number) => {
  viewPortHeight.value = height;
};
const count = ref(4);
const bufferSize = 2;
const startIndex = ref(0);

const endIndex = computed(() => {
  return Math.min(startIndex.value + count.value, props.dataList.length);
});

const visibleList = ref<any[]>([]);
watch(
  [startIndex, endIndex, props.dataList],
  () => {
    visibleList.value = props.dataList.slice(startIndex.value, endIndex.value);
  },
  { immediate: true }
);

let viewPos: { key: number; y: number; dataIndex: number }[] = [];
const offsetIndex = ref(0);

const recyleNode = () => {
  let recyledNode: (typeof viewPos)[0] | undefined;
  if (scrollDirection === "down") {
    recyledNode = viewPos.shift()!;
    recyledNode!.y = viewPos[viewPos.length - 1].y + itemHeight.value;
    recyledNode!.dataIndex = Math.min(
      viewPos[viewPos.length - 1].dataIndex + 1,
      props.dataList.length - 1
    );
    viewPos.push(recyledNode!);
  } else if (scrollDirection === "up") {
    console.log([...viewPos]);
    recyledNode = viewPos.pop()!;
    recyledNode!.y = viewPos[0].y - itemHeight.value;
    recyledNode!.dataIndex = viewPos[0].dataIndex - 1;
    viewPos.unshift(recyledNode!);
  }
  return recyledNode;
};
const layoutNode = () => {
  if (!viewPos.length) return;
  viewPos.forEach((vp) => {
    const node = views.value?.find(
      (node) => node.dataset["key"] === vp.key + ""
    );
    if (node) {
      node.dataset["index"] = vp.dataIndex + "";
      node.style.transform = `translateY(${vp.y}px)`;
    }
  });
};

const onScroll = (offset: number) => {
  if (useNativeScroll) {
    if (offset > scrollTop) {
      scrollDirection = "down";
    } else {
      scrollDirection = "up";
    }
  } else {
    if (offset < scrollTop) {
      scrollDirection = "down";
    } else {
      scrollDirection = "up";
    }
  }

  scrollTop = offset;
  let index = Math.floor(Math.abs(offset / itemHeight.value));
  console.log(index, offset);
  if (
    index !== offsetIndex.value &&
    index + count.value <= props.dataList.length
  ) {
    offsetIndex.value = index;
    const nodeInfo = recyleNode();
    if (props.onUpdateNode && nodeInfo) {
      visibleList.value[nodeInfo.key] = props.dataList[nodeInfo.dataIndex];
    } else {
      updateItem(
        views.value?.find(
          (view) => view.dataset["key"] === nodeInfo?.key + ""
        )!,
        props.dataList[nodeInfo!.dataIndex]
      );
    }
    layoutNode();
  }
};

const fillViewPort = () => {
  count.value =
    Math.ceil(viewPortHeight.value / itemHeight.value) + bufferSize * 2 + 2;
};
watch([itemHeight], () => {
  fillViewPort();
  nextTick(() => {
    viewPos = [];
    views.value?.forEach((node, index) => {
      node.dataset["index"] = index + "";
      node.style.transform = `translateY(${index * itemHeight.value}px)`;
      viewPos.push({
        key: index,
        y: index * itemHeight.value,
        dataIndex: index,
      });
    });
  });
});
const measureItemHeight = () => {
  if (hasMeasureHeight) {
    return;
  }
  if (views.value && views.value.length > 0) {
    const node = views.value[0] as HTMLDivElement;
    const marginTop = node.style.marginTop.match(
      /-?\d+(\.\d+)?([eE][-+]?\d+)?/g
    );
    const marginBottom = node.style.marginBottom.match(
      /-?\d+(\.\d+)?([eE][-+]?\d+)?/g
    );
    let margin = 0;
    if (marginBottom && marginBottom[0]) {
      margin += parseInt(marginBottom[0]);
    }
    if (marginTop && marginTop[0]) {
      margin += parseInt(marginTop[0]);
    }
    if (itemHeight.value !== margin + node.offsetHeight) {
      itemHeight.value = margin + node.offsetHeight;
    }
    hasMeasureHeight = true;
  }
};
watch([props.dataList], () => {
  nextTick(() => {
    measureItemHeight();
  });
});
onMounted(() => {
  measureItemHeight();
});
</script>
<style lang="scss" scoped>
.recycle-list {
  overflow: hidden;
  .heightHolder {
    position: relative;
    .item {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      will-change: transform;
      z-index: 100;
      // content-visibility: auto;
    }
  }
}
</style>
