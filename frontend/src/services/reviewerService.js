import API from "../api/axios";

const reviewCode = async ({
  code,
  language,
}) => {
  const response = await API.post(
    "/api/review-code",
    {
      code,
      language,
    }
  );

  return response.data;
};

export default {
  reviewCode,
};