
import axios from "axios";

const token = localStorage.getItem("token");

export const api = axios.create({
  baseURL: "/", 
  headers: { Authorization: `Bearer ${token}` },
});
