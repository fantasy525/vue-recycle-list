import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  preview: {
    host: "0.0.0.0",
  },
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      less: {},
    },
  },
  server: {
    proxy: {
      "/api/juejin": {
        target: "https://api.juejin.cn",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/juejin/, ""),
        bypass: (req, res, proxyOptions) => {
          if (
            req.headers &&
            req.headers.referer &&
            /^\/api\/juejin(\/|$)/.test(req.url)
          ) {
            // req.headers.Cookie = `_tea_cookie_tokens_2608=%257B%2522web_id%2522%253A%25227163932049110648333%2522%252C%2522user_unique_id%2522%253A%25227163932049110648333%2522%252C%2522timestamp%2522%253A1667982918514%257D; _ga=GA1.2.547157265.1667987187; sid_guard=931f19f7abbd44078abb78527ff1c88e%7C1668939190%7C31536000%7CMon%2C+20-Nov-2023+10%3A13%3A10+GMT; uid_tt=25f4576dc627c12b3c6c6a5f0fbcde99; uid_tt_ss=25f4576dc627c12b3c6c6a5f0fbcde99; sid_tt=931f19f7abbd44078abb78527ff1c88e; sessionid=931f19f7abbd44078abb78527ff1c88e; sessionid_ss=931f19f7abbd44078abb78527ff1c88e; sid_ucp_v1=1.0.0-KGE0OTVkNTAwNzk3YTA4NmIwMjliYzE5MGMxYTkxOWI5OWVkYWQ5ZGQKFwjN_PC-_fXJBRC2--ebBhiwFDgCQPEHGgJsZiIgOTMxZjE5ZjdhYmJkNDQwNzhhYmI3ODUyN2ZmMWM4OGU; ssid_ucp_v1=1.0.0-KGE0OTVkNTAwNzk3YTA4NmIwMjliYzE5MGMxYTkxOWI5OWVkYWQ5ZGQKFwjN_PC-_fXJBRC2--ebBhiwFDgCQPEHGgJsZiIgOTMxZjE5ZjdhYmJkNDQwNzhhYmI3ODUyN2ZmMWM4OGU; _tea_utm_cache_2608={%22utm_source%22:%22gold_browser_extension%22}; csrf_session_id=418a2690d11c6ef77a5811ffb984531b`;
            req.headers.origin = "https://juejin.cn";
            req.headers.referer = "https://juejin.cn";
          }
        },
      },
      "/tos-cn": {
        target: "https://p3-juejin.byteimg.com",
        changeOrigin: true,
        secure: false,
        bypass: (req, res, proxyOptions) => {
          if (req.headers && req.headers.referer) {
            // req.headers.Cookie = `_tea_cookie_tokens_2608=%257B%2522web_id%2522%253A%25227163932049110648333%2522%252C%2522user_unique_id%2522%253A%25227163932049110648333%2522%252C%2522timestamp%2522%253A1667982918514%257D; _ga=GA1.2.547157265.1667987187; sid_guard=931f19f7abbd44078abb78527ff1c88e%7C1668939190%7C31536000%7CMon%2C+20-Nov-2023+10%3A13%3A10+GMT; uid_tt=25f4576dc627c12b3c6c6a5f0fbcde99; uid_tt_ss=25f4576dc627c12b3c6c6a5f0fbcde99; sid_tt=931f19f7abbd44078abb78527ff1c88e; sessionid=931f19f7abbd44078abb78527ff1c88e; sessionid_ss=931f19f7abbd44078abb78527ff1c88e; sid_ucp_v1=1.0.0-KGE0OTVkNTAwNzk3YTA4NmIwMjliYzE5MGMxYTkxOWI5OWVkYWQ5ZGQKFwjN_PC-_fXJBRC2--ebBhiwFDgCQPEHGgJsZiIgOTMxZjE5ZjdhYmJkNDQwNzhhYmI3ODUyN2ZmMWM4OGU; ssid_ucp_v1=1.0.0-KGE0OTVkNTAwNzk3YTA4NmIwMjliYzE5MGMxYTkxOWI5OWVkYWQ5ZGQKFwjN_PC-_fXJBRC2--ebBhiwFDgCQPEHGgJsZiIgOTMxZjE5ZjdhYmJkNDQwNzhhYmI3ODUyN2ZmMWM4OGU; _tea_utm_cache_2608={%22utm_source%22:%22gold_browser_extension%22}; csrf_session_id=418a2690d11c6ef77a5811ffb984531b`;
            req.headers.origin = "https://juejin.cn";
            req.headers.referer = "https://juejin.cn";
          }
        },
      },
    },
  },
  base: "./",
});
