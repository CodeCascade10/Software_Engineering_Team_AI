from graph.builder import build_graph


def main():

    app = build_graph()

    user_input = input("Enter your project idea: ")

    result = app.invoke({
        "user_prompt": user_input
    })

    print("\n========== TASKS ==========\n")

    for task in result["tasks"]:
        if task.strip():
            print(task)

    print("\n========== GENERATED BACKEND CODE ==========\n")

    print(result["backend_code"])

    print("\n========== REVIEW FEEDBACK ==========\n")

    print(result["review_feedback"])


if __name__ == "__main__":
    main()