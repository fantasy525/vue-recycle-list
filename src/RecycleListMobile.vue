<template>
  <div style="position: relative">
    <div class="recycle-list">
      <div
        class="heightHolder"
        :style="{
          height: dataList.list.length * itemHeight + 'px',
        }"
      >
        <div class="virtual-list-wrapper" ref="listWrapper">
          <div
            class="item"
            ref="views"
            :style="{
              height: '249px',
              marginBottom: '10px',
            }"
            v-for="(item, index) in visibleList"
            :key="index"
            :data-key="index"
          >
            <Item
              :digg_user="item.digg_user"
              :row-index="index"
              :msg_Info="item.msg_Info"
              :topic="item.topic"
              :author_user_info="item.author_user_info"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
      "
    >
      <NativelScroll
        :on-scroll="onScroll"
        :on-viewport-height-change="onViewportHeightChange"
      >
        <div
          class="heightHolder"
          :style="{
            height: dataList.list.length * itemHeight + 'px',
          }"
        ></div>
      </NativelScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import NativelScroll from "./components/nativeScroll/index.vue";
// import VirtualScroller from "./virtualScroll/VirtualScroller.vue";
import Item from "./components/Item.vue";

import useItem from "./components/useItem";
import axios from "axios";
import throttle from "lodash/throttle";
const http = axios.create({
  baseURL: "/api/juejin",
  withCredentials: true,
});

let cursor = "0";

const dataList = reactive<{ list: any[] }>({ list: [] });

const getList = () => {
  http
    .post<{
      err_no: number;
      has_more: boolean;
      data: any[];
      count: number;
      cursor: string;
    }>(
      "/recommend_api/v1/short_msg/recommend?aid=2608&uuid=7163932049110648333&spider=0",
      {
        cursor,
        id_type: 4,
        limit: 100,
        sort_type: 300,
      }
    )
    .then((res) => {
      if (res.status === 200 && res.data.err_no === 0) {
        cursor = res.data.cursor;
        // const arr = new Array(100).fill(0).map(() => {
        //   return res.data.data[0];
        // });
        console.log("set list");
        dataList.list.push(...res.data.data);
      }
    });
};
const { avatar } = useItem();
const views = ref<HTMLDivElement[]>();
const itemHeight = ref(100);
let scrollTop = 0;
let scrollDirection: "down" | "up" = "down";
let hasMeasureHeight = false;

const viewPortHeight = ref(0);
const listWrapper = ref<HTMLDivElement>();
const onViewportHeightChange = (height: number) => {
  viewPortHeight.value = height;
};
const count = ref(4);
const bufferSize = 2;
const startIndex = ref(0);

const endIndex = computed(() => {
  return Math.min(startIndex.value + count.value, dataList.list.length);
});

const visibleList = ref<(typeof dataList.list)[0][]>([]);
watch(
  [startIndex, endIndex, dataList.list],
  () => {
    visibleList.value = dataList.list.slice(startIndex.value, endIndex.value);
  },
  { immediate: true }
);

let viewPos: { key: number; y: number; dataIndex: number }[] = [];
const offsetIndex = ref(0);

const updateNode = throttle((targetPos: (typeof viewPos)[0]) => {
  const itemNode = views.value?.find(
    (node) => node.dataset["key"] === targetPos.key + ""
  );
  if (!itemNode) {
    return;
  }
  const data = dataList.list[targetPos.dataIndex];
  const avatarNode = itemNode.querySelector<HTMLImageElement>(".one-img")!;
  const userName = itemNode.querySelector<HTMLSpanElement>(".name");
  const pinContent = itemNode.querySelector<HTMLSpanElement>(".pin-content");
  const timeBefore = itemNode.querySelector<HTMLSpanElement>(".timeBefore");
  //action-title"
  const commentCount = itemNode.querySelector<HTMLSpanElement>(".commentCount");
  const diggCount = itemNode.querySelector<HTMLSpanElement>(".diggCount");
  if (data.msg_Info) {
    commentCount!.textContent = data.msg_Info.comment_count + "";
    diggCount!.innerText = data.msg_Info.digg_count + "";
    timeBefore!.innerText = `${Math.floor(
      (Date.now() - Number(data.msg_Info.ctime) * 1000) / 1000 / 60
    )}`;
    pinContent!.innerText = data.msg_Info.content;
  }
  avatarNode.src = avatar(data);
  userName!.innerText = `${targetPos.dataIndex}-${data.author_user_info.user_name}`;
}, 16.7);
const layoutNode = () => {
  if (!viewPos.length) return;
  let targetInfo: (typeof viewPos)[0] | undefined;
  if (scrollDirection === "down") {
    targetInfo = viewPos.shift()!;
    targetInfo!.y = viewPos[viewPos.length - 1].y + itemHeight.value;
    targetInfo!.dataIndex = Math.min(
      viewPos[viewPos.length - 1].dataIndex + 1,
      dataList.list.length - 1
    );
    viewPos.push(targetInfo!);
  } else if (scrollDirection === "up") {
    targetInfo = viewPos.pop()!;
    targetInfo!.y = viewPos[0].y - itemHeight.value;
    targetInfo!.dataIndex = viewPos[0].dataIndex - 1;
    viewPos.unshift(targetInfo!);
  }
  viewPos.forEach((vp) => {
    const node = views.value?.find(
      (node) => node.dataset["key"] === vp.key + ""
    );
    if (node) {
      node.dataset["index"] = vp.dataIndex + "";
      node.style.transform = `translateY(${vp.y}px)`;
    }
  });
  return targetInfo;
};

const onScroll = (offset: number) => {
  console.log(offset);
  if (offset < scrollTop) {
    scrollDirection = "down";
  } else {
    scrollDirection = "up";
  }
  scrollTop = offset;
  let index = Math.floor(Math.abs(offset / itemHeight.value));
  if (index !== offsetIndex.value) {
    offsetIndex.value = index;
    const targetInfo = layoutNode();
    targetInfo && updateNode(targetInfo);
  }
};

const fillViewPort = () => {
  count.value =
    Math.ceil(viewPortHeight.value / itemHeight.value) + bufferSize * 2;
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
watch([dataList.list], () => {
  nextTick(() => {
    measureItemHeight();
  });
});
onMounted(() => {
  getList();
  measureItemHeight();
});
</script>
<style lang="scss">
.recycle-list {
  overflow: hidden;
}
.virtual-list-wrapper {
  position: relative;
  .item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    will-change: transform;
    z-index: 100;
  }
}
</style>
