import API from "../api/axios";

export const googleLogin = async (googleUser) => {

  const response = await API.post(
    "/auth/google",
    googleUser
  );

  return response.data;
};