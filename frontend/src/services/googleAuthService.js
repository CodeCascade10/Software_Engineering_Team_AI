import API from "../api/axios";

export const googleLogin = async (credential) => {

  const response = await API.post(
    "/auth/google",
    { credential }
  );

  return response.data;
};
