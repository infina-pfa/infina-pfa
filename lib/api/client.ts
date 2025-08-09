import axios from "axios";
import { INFINA_FINANCIAL_SERVICE_URL } from "../config";

export const getClient = (accessToken: string) =>
  axios.create({
    baseURL: INFINA_FINANCIAL_SERVICE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
