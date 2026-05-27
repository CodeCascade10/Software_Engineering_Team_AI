import { useState } from "react";

import reviewerService from "../../../services/reviewerService";

export default function useReviewer() {

  const [code, setCode] =
    useState("");

  const [language, setLanguage] =
    useState("auto");

  const [reviewResult, setReviewResult] =
    useState("");

  const [isReviewing, setIsReviewing] =
    useState(false);

  const [reviewError, setReviewError] =
    useState("");

  const detectLanguage = (codeText) => {

    if (
      codeText.includes("#include") ||
      codeText.includes("cout")
    ) {
      return "cpp";
    }

    if (
      codeText.includes("console.log") ||
      codeText.includes("function")
    ) {
      return "javascript";
    }

    if (
      codeText.includes("def ") ||
      codeText.includes("print(")
    ) {
      return "python";
    }

    if (
      codeText.includes("public static void main")
    ) {
      return "java";
    }

    return "plaintext";
  };

  const handleReview =
    async () => {

      if (!code.trim()) {

        setReviewError(
          "Please paste some code"
        );

        return;
      }

      try {

        setIsReviewing(true);

        setReviewError("");

        setReviewResult("");

        const finalLanguage =

          language === "auto"
            ? detectLanguage(code)
            : language;

        const response =
          await reviewerService.reviewCode({

            code,
            language: finalLanguage,
          });

        console.log(
          "Reviewer Response:",
          response
        );

        const reviewText =

          response?.review ||

          response?.data?.review ||

          response?.message ||

          "No review generated";

        setReviewResult(
          reviewText
        );

      } catch (err) {

        console.error(err);

        setReviewError(

          err?.response?.data?.detail ||

          err?.message ||

          "Failed to review code"
        );

      } finally {

        setIsReviewing(false);
      }
    };

  return {

    code,
    setCode,

    language,
    setLanguage,

    reviewResult,

    isReviewing,

    reviewError,

    handleReview,
  };
}