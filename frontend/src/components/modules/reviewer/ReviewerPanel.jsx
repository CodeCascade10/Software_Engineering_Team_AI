import ReviewerForm from "./ReviewerForm";

import ReviewerResult from "./ReviewerResult";

import useReviewer from "./useReviewer";

export default function ReviewerPanel() {

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
              AI-powered static analysis, bug detection,
              security auditing, and performance inspection.
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