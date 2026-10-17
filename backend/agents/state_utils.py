def merge_files(existing, updates, *, remove_names=()):
    replaced = {item["file_name"] for item in updates} | set(remove_names)
    merged = [item for item in existing if item["file_name"] not in replaced]
    merged.extend(updates)
    return merged


def validation_failures(results):
    failures = []
    for result in results:
        for check in result.get("checks", []):
            if not check.get("passed") and check.get("mandatory", True):
                failures.append(check)
    return failures


def stage_timings(state, stage, duration):
    return {**state.get("stage_timings", {}), stage: round(duration, 3)}
