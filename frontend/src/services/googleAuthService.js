import API from "../api/axios";

export const googleLogin = async (token) => {
  const response = await API.post(
    "/auth/google",
    {
      token,
    }
  );

  return response.data;
};