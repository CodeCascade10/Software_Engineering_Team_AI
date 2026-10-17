import ReactMarkdown from "react-markdown";
import ReviewerForm from "./ReviewerForm";

import ReviewerResult from "./ReviewerResult";

import useReviewer from "./useReviewer";

export default function ReviewerPanel({ reviewContent }) {

  const {

    code,
    setCode,

    language,
    setLanguage,

    reviewResult,

    isReviewing,

    reviewError,

    handleReview,

  } = useReviewer();

  return (

    <div className="w-full space-y-8">

      {/* HEADER */}
      <div className="
        rounded-[28px]
        border
        border-white/[0.05]
        bg-[#0c0e14]/70
        backdrop-blur-xl
        p-8
      ">

        <div className="flex items-center justify-between flex-wrap gap-4">

          <div>

            <h1 className="
              text-4xl
              font-black
              text-white
              tracking-tight
            ">
              AI Code Reviewer
            </h1>

            <p className="
              text-brand-muted
              mt-2
              text-sm
            ">
              LLM-assisted review findings for the generated project. This review does not claim to run tests or static analysis tools.
            </p>
          </div>

          <div className="
            px-4
            py-2
            rounded-2xl
            bg-brand-blue/10
            border
            border-brand-blue/20
            text-brand-blue
            text-xs
            font-bold
            uppercase
            tracking-[0.2em]
          ">
            Groq + Llama 3.3
          </div>
        </div>
      </div>

      {reviewContent && (
        <article className="rounded-[28px] border border-brand-green/20 bg-[#0c0e14]/70 p-8 prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white">Generated project review</h2>
          <ReactMarkdown>{reviewContent}</ReactMarkdown>
        </article>
      )}

      {/* MAIN CONTENT */}
      <div className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-8
      ">

        {/* LEFT PANEL */}
        <ReviewerForm

          code={code}
          setCode={setCode}

          language={language}
          setLanguage={setLanguage}

          handleReview={handleReview}

          isReviewing={isReviewing}
        />

        {/* RIGHT PANEL */}
        <ReviewerResult

          reviewResult={reviewResult}

          reviewError={reviewError}

          isReviewing={isReviewing}
        />
      </div>
    </div>
  );
}
