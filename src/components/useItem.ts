import { computed } from "vue";
import ItemVue from "./Item.vue";
type ItemProps = GetProps<typeof ItemVue>;
const useItem = () => {
  const theme = (props: any) => {
    const newContent = props.msg_Info.content;
    const resultArr = newContent.match(/#.*#/);
    if (resultArr && resultArr.length) {
      return resultArr[0];
    }
    return "";
  };
  const msgContent = (props: ItemProps) => {
    const newContent = props.msg_Info.content;
    const resultArr = newContent.match(/\]\s*(.+)/);
    if (resultArr && resultArr.length > 1) {
      return resultArr[1];
    }
    return newContent;
  };

  const contentImg = (props: ItemProps) => {
    const result = (props.msg_Info.pic_list[0] || "").match(/(.+?)-watermark/);
    if (!result) {
      return props.msg_Info.pic_list[0];
    }
    return result[1] + "-zoom-mark-crop-v2:460:460:0:0.png";
  };
  const avatar = (props: ItemProps) => {
    const result = (props.author_user_info.avatar_large || "").match(/(.+?)~/);
    if (!result) {
      return props.author_user_info.avatar_large;
    }
    const url = result[1] + "~100x100.png";

    return url;
  };
  const diggImgs = (props: ItemProps) => {
    return props.digg_user.map((img) => {
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
        avatar_large:
          "https://p3-passport.byteimg.com/img/user-avatar/f473fe0a6acad85f4d37b3097b59e6d0~100x100.png",
      };
    });
  };
  const updateItem = (itemNode: HTMLDivElement, data: ItemProps) => {
    if (!data) {
      debugger;
    }
    const avatarNode = itemNode.querySelector<HTMLImageElement>(".one-img")!;
    const userName = itemNode.querySelector<HTMLSpanElement>(".name");
    const pinContent = itemNode.querySelector<HTMLSpanElement>(".pin-content");
    const timeBefore = itemNode.querySelector<HTMLSpanElement>(".timeBefore");
    //action-title"
    const commentCount =
      itemNode.querySelector<HTMLSpanElement>(".commentCount");
    const diggCount = itemNode.querySelector<HTMLSpanElement>(".diggCount");
    if (data.msg_Info) {
      commentCount!.innerText = data.msg_Info.comment_count + "";
      diggCount!.innerText = data.msg_Info.digg_count + "";
      timeBefore!.innerText = `${Math.floor(
        (Date.now() - Number(data.msg_Info.ctime) * 1000) / 1000 / 60
      )}`;
      pinContent!.innerText = data.msg_Info.content;
    }

    avatarNode.src = avatar(data);

    userName!.innerText = `${data.author_user_info.user_name}`;
  };
  return { theme, contentImg, avatar, msgContent, diggImgs, updateItem };
};

export default useItem;
