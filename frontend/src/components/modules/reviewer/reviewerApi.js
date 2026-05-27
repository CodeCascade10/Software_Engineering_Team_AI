import axios from "axios";

const API_URL =
  "http://127.0.0.1:8000/api";

export const reviewCode =
  async ({
    code,
    language,
  }) => {

    const response =
      await axios.post(

        `${API_URL}/review-code`,

        {
          code,
          language,
        }
      );

    return response.data;
};