from graph.builder import build_graph


def main():

    print("\n========== AI SOFTWARE ENGINEERING TEAM ==========\n")

    app = build_graph()

    user_input = input(
        "Enter your project idea: "
    )

    result = app.invoke({
        "user_prompt": user_input,
        "retry_count": 0
    })

    # ── TASKS ─────────────────────────────────────
    print("\n========== TASKS ==========\n")

    for task in result.get("tasks", []):

        if task.strip():

            print(task)

    # ── GENERATED BACKEND ─────────────────────────
    print(
        "\n========== GENERATED BACKEND CODE ==========\n"
    )

    print(
        result.get(
            "backend_code",
            "No backend code generated."
        )
    )

    # ── REVIEW FEEDBACK ───────────────────────────
    print(
        "\n========== REVIEW FEEDBACK ==========\n"
    )

    print(
        result.get(
            "review_feedback",
            "No review feedback available."
        )
    )

    # ── EXECUTION OUTPUT ──────────────────────────
    print(
        "\n========== EXECUTION OUTPUT ==========\n"
    )

    print(
        result.get(
            "execution_output",
            "No execution output available."
        )
    )

    # ── TEST RESULTS ──────────────────────────────
    print(
        "\n========== API TEST RESULTS ==========\n"
    )

    print(
        result.get(
            "test_results",
            "No API test results available."
        )
    )

    # ── RETRY COUNT ───────────────────────────────
    print(
        "\n========== RETRY COUNT ==========\n"
    )

    print(
        result.get(
            "retry_count",
            0
        )
    )


if __name__ == "__main__":

    main()