import { baseApi } from "@/app/api/baseApi";
import type { RegistrationData } from "@/entities/authRegistration";

export interface RegistrationResponse {
  id: number;
  login: string;
  created_at: string;
  updated_at: string;
}

export const registrationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registration: builder.mutation<RegistrationResponse, RegistrationData>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useRegistrationMutation } = registrationApi;
