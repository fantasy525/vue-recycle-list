<template>
  <div class="pin">
    <div class="pin-header">
      <div class="account">
        <ImageAvatar
          class="one-img"
          :src="avatar"
          :default="author_user_info.avatar_large"
        />
        <div class="head-content">
          <p class="name">{{ rowIndex }}-{{ author_user_info.user_name }}</p>
          <div class="meta">
            <div data-v-2d817bd6="" class="position ellipsis">
              {{ author_user_info.user_name }}
            </div>
            <div class="dot">·</div>
            <p>
              <span class="timeBefore">{{
                Math.floor((Date.now() - msg_Info.ctime * 1000) / 1000 / 60)
              }}</span
              >分钟前
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="pin-content">
      <span class="theme" v-if="theme">
        {{ theme.replace(msg_Info.theme_id, "") }}
      </span>
      {{ msgContent }}
    </div>
    <div class="pin-img" v-if="msg_Info.pic_list.length">
      <img
        class="pinImg"
        :src="contentImg"
        style="transform: translate3d(0, 0, 0)"
      />
    </div>
    <div class="club-digg">
      <div>
        <div class="pin-club">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="club-icon"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8ZM11.36 8C11.7135 8 12.0052 8.28834 11.9489 8.63729C11.8578 9.20177 11.6463 9.74274 11.3259 10.2223C10.8864 10.8801 10.2616 11.3928 9.53073 11.6955C8.79983 11.9983 7.99556 12.0775 7.21964 11.9231C6.44371 11.7688 5.73098 11.3878 5.17157 10.8284C4.61216 10.269 4.2312 9.55628 4.07686 8.78036C3.92252 8.00444 4.00173 7.20017 4.30448 6.46927C4.60723 5.73836 5.11992 5.11365 5.77772 4.67412C6.25726 4.3537 6.79823 4.14219 7.36271 4.05109C7.71166 3.99477 8 4.28654 8 4.64C8 4.99346 7.7096 5.27254 7.36588 5.35495C7.05478 5.42953 6.75763 5.55881 6.48885 5.7384C6.04155 6.03728 5.69292 6.46209 5.48705 6.9591C5.28118 7.45612 5.22731 8.00302 5.33226 8.53065C5.43722 9.05827 5.69627 9.54293 6.07667 9.92333C6.45707 10.3037 6.94173 10.5628 7.46935 10.6677C7.99698 10.7727 8.54388 10.7188 9.0409 10.513C9.53791 10.3071 9.96272 9.95845 10.2616 9.51115C10.4412 9.24237 10.5705 8.94522 10.6451 8.63412C10.7275 8.2904 11.0065 8 11.36 8ZM10.5 6.5C11.0523 6.5 11.5 6.05228 11.5 5.5C11.5 4.94772 11.0523 4.5 10.5 4.5C9.94771 4.5 9.5 4.94772 9.5 5.5C9.5 6.05228 9.94771 6.5 10.5 6.5Z"
              fill="#1E80FF"
            ></path>
          </svg>
          <span>{{ topic.title }}</span>
          <svg
            data-v-7b4cc00e=""
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="right-arrow"
          >
            <path
              data-v-7b4cc00e=""
              d="M3.11146 0.717157C2.95525 0.560948 2.70198 0.560948 2.54577 0.717157C2.38956 0.873367 2.38956 1.12663 2.54577 1.28284L3.11146 0.717157ZM5.65704 3.82843L5.93988 4.11127C6.09609 3.95506 6.09609 3.70179 5.93988 3.54558L5.65704 3.82843ZM2.54577 6.37401C2.38956 6.53022 2.38956 6.78349 2.54577 6.9397C2.70198 7.09591 2.95525 7.09591 3.11146 6.9397L2.54577 6.37401ZM2.54577 1.28284L5.3742 4.11127L5.93988 3.54558L3.11146 0.717157L2.54577 1.28284ZM5.3742 3.54558L2.54577 6.37401L3.11146 6.9397L5.93988 4.11127L5.3742 3.54558Z"
              fill="#1E80FF"
            ></path>
          </svg>
        </div>
      </div>
      <div style="flex: 1 1 auto"></div>
      <div class="digg-container digg-box is-link" v-if="diggImgs.length">
        <div data-v-6d4e3486="" class="list">
          <img
            v-for="(img, index) in diggImgs"
            :src="img.avatar_large"
            :key="index"
            class="lazy avatar item"
          />
        </div>
        <span data-v-6d4e3486="" class="label"
          >{{ diggImgs.length > 2 ? "等人" : "" }}赞过</span
        >
        <!---->
      </div>
    </div>
    <div class="pin-action">
      <div class="action">
        <div class="action-title-box">
          <span class="icon normal-icon share-icon"></span>
          <span class="action-title">分享</span>
        </div>
      </div>
      <div class="comment-action action">
        <div class="action-title-box">
          <span class="icon normal-icon comment-icon"></span>
          <span class="action-title commentCount">
            {{ msg_Info.comment_count }}
          </span>
        </div>
      </div>
      <div class="like-action action">
        <div class="action-title-box">
          <span class="icon Like small-icon"></span>
          <span class="action-title diggCount">
            {{ msg_Info.digg_count }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import ImageAvatar from "./ImageAvatar.vue";
const props = defineProps<{
  rowIndex: number;
  author_user_info: {
    avatar_large: string;
    user_name: string;
  };
  msg_Info: {
    digg_count: number;
    comment_count: number;
    ctime: number;
    content: string;
    theme_id: string;
    pic_list: string[];
  };
  digg_user: { avatar_large: string }[];
  topic: {
    title: string;
  };
}>();

const theme = computed(() => {
  const newContent = props.msg_Info.content;
  const resultArr = newContent.match(/#.*#/);
  if (resultArr && resultArr.length) {
    return resultArr[0];
  }
  return "";
});
const msgContent = computed(() => {
  const newContent = props.msg_Info.content;
  const resultArr = newContent.match(/\]\s*(.+)/);
  if (resultArr && resultArr.length > 1) {
    return resultArr[1];
  }
  return newContent;
});

const contentImg = computed(() => {
  let url = "";
  const prefix = (props.msg_Info.pic_list[0] || "").match(/\/.+?(\/.+)/);
  if (prefix && prefix.length > 1) {
    url = prefix[1];
  }
  const result = url.match(/(.+?)-watermark/);
  if (!result) {
    return props.msg_Info.pic_list[0];
  }

  return (
    "http://172.24.198.122:5173" +
    result[1] +
    "-zoom-mark-crop-v2:460:460:0:0.png"
  );
});
const avatar = computed(() => {
  const result = (props.author_user_info.avatar_large || "").match(/(.+?)~/);
  if (!result) {
    return props.author_user_info.avatar_large;
  }
  const url = result[1] + "~100x100.png";

  return url;
});
const diggImgs = computed(() => {
  let res = props.digg_user.map((img) => {
    let webpImg = "";
    const result = (img.avatar_large || "").match(/(.*?)~/);
    if (!result) {
      webpImg = img.avatar_large;
    } else {
      webpImg = result[1];
    }
    const url = webpImg + "~100x100.png";
    return {
      ...img,
      avatar_large: url,
    };
  });
  return res;
});
</script>
<style scoped lang="scss">
.pin {
  background-color: #fff;
  border-radius: 4px;
  padding: 10px 10px 0;
  position: relative;
  height: 100%;
  box-sizing: border-box;
  margin: 0 10px;
  overflow: hidden;
}
.pin-header {
  margin-right: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  .account {
    display: flex;
    .one-img {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
    }
    .head-content {
      margin-left: 12px;
    }
    .name {
      font-weight: 500;
      font-size: 16px;
      line-height: 28px;
      color: #252933;
    }
    .meta {
      display: flex;
      align-items: center;
      font-size: 14px;
      line-height: 24px;
      color: #8a919f;
      cursor: default;
      white-space: nowrap;
    }
    .position {
      max-width: 24rem;
    }
    .dot {
      margin: 0 0.5em;
    }
  }
}
.pin-content {
  height: 40px;
  overflow-y: auto;
  .theme {
    color: #1e80ff;
  }
  color: #17181a;
  font-size: 14px;
  line-height: 20px;
  white-space: pre-line;
  text-align: left;
  margin-left: 74px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-family: -apple-system, system-ui, Segoe UI, Roboto, Ubuntu, Cantarell,
    Noto Sans, sans-serif, BlinkMacSystemFont, Helvetica Neue, PingFang SC,
    Hiragino Sans GB, Microsoft YaHei, Arial !important;
}
.pin-img {
  text-align: left;
  margin-left: 74px;
  width: 200px;
  height: 47px;
  overflow-y: auto;
  margin-top: 8px;
  background-color: #86909c;
  img {
    width: 100%;
    aspect-ratio: 1;
  }
}
.club-digg {
  position: relative;
  margin: 8px 0 0 60px;
  margin-top: 12px;
  display: flex;
  .pin-club {
    display: flex;
    width: fit-content;
    justify-content: center;
    align-items: center;
    padding: 2px 6px;
    background-color: #eaf2ff;
    font-size: 12px;
    line-height: 20px;
    color: #1e80ff;
    border-radius: 50px;
    .club-icon {
      margin-right: 0.3em;
    }
    .right-arrow {
      margin-left: 2px;
    }
  }
  .digg-container {
    display: flex;
    line-height: 24px;
    align-items: center;
    .list {
      display: flex;
    }
    .item {
      width: 22px;
      height: 22px;
      border: 2px solid #fff;
      border-radius: 50%;
      margin-right: -6px;
    }
    .item:last-child {
      margin-right: 4px;
    }
    .label {
      font-size: 14px;
      line-height: 24px;
      color: #8a919f;
    }
  }
}
.pin-action {
  margin-top: 12px;
  margin-left: -20px;
  margin-right: -20px;
  display: flex;
  position: absolute;
  height: 36px;
  border-top: 1px solid #e4e6eb;
  color: #86909c;
  bottom: 0;
  left: 0;
  width: 100%;
  .action {
    flex: 1 1 33.333%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 100%;
    cursor: pointer;

    user-select: none;
    .action-title-box {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .share-icon {
      background: url(//lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/36d78e150182aba28d468489573a7dbf.svg)
        0 0 no-repeat;
      width: 16px;
      height: 16px;
    }
    .action-title {
      margin-left: 0.3em;
      font-size: 12px;
      font-weight: 400;
      display: inline-block;
    }
    .comment-icon {
      background: url(//lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/a9532d230b98d8920a987aafa22e9059.svg)
        0 0 no-repeat;
      width: 16px;
      height: 16px;
    }
    .Like {
      background: url(//lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/b63038829982183f1741af41ac12d650.svg)
        0 0 no-repeat;
    }
    .small-icon {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
