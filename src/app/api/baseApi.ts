import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/app/store";

// 🔹 Типизация ответа от сервера (подставьте свои поля)
interface RefreshResponse {
  access_token: string;
  refresh_token?: string; // если бэкенд возвращает и новый рефреш
}

// 🔹 Вспомогательная функция: получаем refresh_token из хранилища
// Вариант А: Если у вас в сторе лежит объект { access_token, refresh_token }
// const getRefreshToken = (state: RootState): string | null => {
//   return state.token?.refreshToken || null;
// };

// Вариант Б: Если рефреш "зашит" внутрь JWT (нужно декодировать)
import { jwtDecode } from "jwt-decode";
import type { Token } from "@/entities/authLogin";

const getRefreshToken = (state: RootState): string | null => {
  try {
    const decoded: Token | null = state.token.refreshToken
      ? jwtDecode(state.token.refreshToken)
      : null;
    return decoded?.refresh_token || null;
  } catch {
    return null;
  }
};

const baseQuery = fetchBaseQuery({
  baseUrl: "http://77.91.94.81:8000",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).token;
    // Если token - это объект, берем строку доступа:
    const accessToken = typeof token === "object" ? token.accessToken : token;

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Определяем, является ли запрос запросом на рефреш (защита от цикла)
  const isRefreshRequest = (
    typeof args === "string" ? args : args.url
  )?.includes("/auth/refresh");

  // 🔹 Если получили 401 и это не запрос на рефреш
  if (result.error?.status === 401 && !isRefreshRequest) {
    // 1. Берем рефреш-токен из стора
    const refreshToken = getRefreshToken(api.getState() as RootState);

    if (refreshToken) {
      // 2. Делаем запрос на обновление, отправляя его В ТЕЛЕ (body)
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: {
            refresh_token: refreshToken, // 👈 отправка в теле запроса
          },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const { access_token, refresh_token } =
          refreshResult.data as RefreshResponse;

        // 3. Обновляем стору новыми токенами
        // ВАЖНО: Замените на ваши реальные экшены!
        api.dispatch({
          type: "auth/setTokens",
          payload: { access_token, refresh_token },
        });

        // 4. Повторяем ОРИГИНАЛЬНЫЙ запрос, который упал с 401
        result = await baseQuery(args, api, extraOptions);
      } else {
        // 5. Если рефреш не удался (401/403) — чистим авторизацию
        api.dispatch({ type: "auth/logout" });
      }
    } else {
      // Нет рефреш-токена — сразу разлогиниваем
      api.dispatch({ type: "auth/logout" });
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth, // 👈 подключаем обертку
  tagTypes: ["User"],
  endpoints: () => ({}),
});
