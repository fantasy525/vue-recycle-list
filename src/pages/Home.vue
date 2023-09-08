<template>
  <div>
    <div style="background-color: #f2f3f5; height: 500px; overflow: hidden">
      <FixedSizedList
        :data-list="dataList.list"
        v-slot="{ item }: { item: ItemProps }"
      >
        <Item
          :author_user_info="item.author_user_info"
          :digg_user="item.digg_user"
          :row-index="item.rowIndex"
          :msg_Info="item.msg_Info"
          :topic="item.topic"
        ></Item>
      </FixedSizedList>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { FixedSizedList } from "../components/recycleList";
import axios from "axios";
import Item from "../components/Item.vue";
import mockData from "../assets/data.json";

type ItemProps = GetProps<InstanceType<typeof Item>>;

// type FixedSizedListProps = InstanceType<typeof FixedSizedList>["$props"];
const http = axios.create({
  baseURL: "/api/juejin",
  withCredentials: true,
});

let cursor = "0";

const dataList = reactive<{ list: any[] }>({
  list: mockData.data.map((m, index) => {
    return { ...m, rowIndex: index };
  }),
});

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
        res.data.data = res.data.data.map((item, index) => {
          return { ...item, rowIndex: index };
        });
        dataList.list.push(...res.data.data);
      }
    });
};

onMounted(() => {
  getList();
});
</script>
