import {
  computed,
  nextTick,
  onBeforeMount,
  onMounted,
  ref,
  Ref,
  watchEffect,
} from "vue";
import { generateBezier } from "./generateBezier";
// 0.2, 0.96, 0.5, 1
//0.26, 0.67, 0.42, 0.83
//0.26, 0.67, 0.18, 0.94
// .3,.79,.57,.9
// 0.18, 0.7, 0.48, 0.91
// .32,.57,.46,.86
// 0.165, 0.84, 0.44, 1
// 0.26, 0.73, 0.34, 0.96

const bezier = generateBezier(0.25, 0.46, 0.45, 0.94);
const useScroll = (
  scroller: Ref<HTMLElement | undefined>,
  scrollerWrapper: Ref<HTMLElement | undefined>,
  scrollerHeight: Ref<number | undefined>,
  height: Ref<number | undefined>,
  onScroll: (offset: number) => Promise<void>,
  onReachBottom?: () => void
) => {
  let translateY = 0;
  let startY = 0;
  let endY = 0;
  let momentumStartY = 0;
  let startTime = 0;
  const observerScrollerHeight = ref(0);
  const maxY = ref(0);
  let momentStatus: "start" | "doing" | "end" = "end";
  watchEffect(() => {
    if (height.value !== undefined && scrollerHeight.value !== undefined) {
      maxY.value = Math.ceil(scrollerHeight.value! - height.value);
    }
  });
  let rafHandler = 0;
  const ro = ref<ResizeObserver>();
  const dispatchOnScroll: typeof onScroll = (offset) => {
    if (Math.abs(offset) === maxY.value) {
      onReachBottom && onReachBottom();
    }
    return onScroll(offset);
  };
  function setTranslateY(y: number) {
    if (y !== translateY) {
      translateY = y;
      dispatchOnScroll(translateY);
    }
  }

  const momentum = (moveEnd: number, moveStart: number, duration: number) => {
    momentStatus = "start";
    // 惯性滑动加速度
    const deceleration = 0.003;
    // 拖动的有效惯性距离，不一定是从onStart到onEnd的距离，比如缓慢拖动的时候是最后一次onmove到onend的距离
    const distance = moveEnd - moveStart;
    // 1. 根据距离和时长计算滑块的末速度；根据物理知识得出 v1 = 2S / t
    const speed = (2 * Math.abs(distance)) / duration;
    /**
     * 2. 根据末速度计算惯性滑动的距离；匀减速运动末速度为0；S = -(v1*v1) / 2a,由于a是负数
          因此为了方便计算，把-1/2a 定义为常量A简化方程为 S =( v1*v1) / A
          由于v1平方会导致算出的距离很大，因此简化为S = v1 / A,我们只需要定义一个常量即可
     */
    const dis =
      ((speed * speed * 0.17) / deceleration) * (distance < 0 ? -1 : 1);
    const stopAt = moveEnd + dis;

    const a = 0.005;
    let totalTime = parseInt(speed / a + "");
    if (totalTime < 500) {
      totalTime = totalTime + 500;
    }
    // 自己模拟惯性滑动
    const run = () => {
      let startTime: number;
      let progress = 0;
      const anim = (time: number) => {
        progress = (time - startTime) / totalTime;
        if (progress >= 1) {
          progress = 1;
          momentStatus = "end";
          return;
        }
        let step = bezier(progress, moveEnd, stopAt);
        if (step > 0) {
          step = 0;
          momentStatus = "end";
        } else if (step < -maxY.value) {
          step = -maxY.value;
          momentStatus = "end";
        }
        setTranslateY(step);
        if (momentStatus !== "end") {
          cancelAnimationFrame(rafHandler);
          rafHandler = window.requestAnimationFrame((t) => {
            momentStatus = "doing";
            anim(t);
          });
        }
      };
      const start = () => {
        startTime = performance.now();
        momentStatus = "doing";
        anim(startTime);
      };
      start();
    };

    run();
  };
  const stop = () => {
    cancelAnimationFrame(rafHandler);
    momentStatus = "end";
    // 获取当前 translate 的位置
    setTranslateY(translateY);
  };
  const onStart = (e: TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    stop();
    startY = e.changedTouches[0].pageY;
    momentumStartY = endY = translateY;
    startTime = new Date().getTime();
  };

  const onMove = (e: TouchEvent) => {
    const now = new Date().getTime();
    const movePageY = e.changedTouches[0].pageY;
    const moveDis = movePageY - startY;
    // 上次的Y加本次产生的位移
    let currentY = endY + moveDis;
    if (currentY > 0) {
      currentY = 0;
    }
    if (currentY < -maxY.value) {
      currentY = -maxY.value;
    }
    // 如果时间超过300ms则用此次产生的时间戳和唯一当开始算 momentum的位置起始点
    // 如果没超过300ms则说明用户滑动的很快,用touchStart的起始点就可以
    if (now - startTime > 200) {
      startTime = now;
      momentumStartY = translateY;
    }
    setTranslateY(currentY);
  };

  const onEnd = (e: TouchEvent) => {
    if (translateY > 0 || translateY < -maxY.value) {
      return;
    }
    const dis = Math.abs(translateY - momentumStartY);
    const now = new Date().getTime();
    const duration = now - startTime;
    if (now - startTime < 200 && dis > 15) {
      momentum(translateY, momentumStartY, duration);
    }
  };

  onMounted(() => {
    ro.value = new ResizeObserver((enties) => {
      if (enties.length) {
        observerScrollerHeight.value = scroller.value!.scrollHeight;
      }
    });
    ro.value.observe(scroller.value!);
  });
  onMounted(() => {
    if (!scroller.value) return;
    scroller.value.addEventListener("touchstart", onStart);
    scroller.value!.addEventListener("touchmove", onMove);
    scroller.value!.addEventListener("touchend", onEnd);
    scroller.value!.addEventListener("touchcancel", onEnd);
  });
  onBeforeMount(() => {
    ro.value?.disconnect();
    if (!scroller.value) return;
    scroller.value.removeEventListener("touchstart", onStart);
    scroller.value.removeEventListener("touchmove", onMove);
    scroller.value.removeEventListener("touchend", onEnd);
    scroller.value.removeEventListener("touchcancel", onEnd);
  });
};
export default useScroll;
