export async function provisionClusterPod(
  clusterPods,
  setClusterPods,
  setIsClusterScaling,
  pushToast
) {

  try {

    setIsClusterScaling(true);

    pushToast(
      "Provisioning new orchestration pod..."
    );

    await new Promise((res) =>
      setTimeout(res, 1800)
    );

    const newPod = {
      id: `pod_dynamic_${Date.now()}`,
      name: `sb-runtime-node-${
        clusterPods.length + 1
      }`,
      status: "online",
      load: Math.floor(
        Math.random() * 35
      ),
      ram: `${(
        Math.random() * 8 +
        2
      ).toFixed(1)}GB`,
    };

    setClusterPods((prev) => [
      ...prev,
      newPod,
    ]);

    pushToast(
      "Cluster node provisioned successfully",
      "success"
    );

  } catch (err) {

    console.error(err);

    pushToast(
      "Failed to provision cluster node",
      "error"
    );

  } finally {

    setIsClusterScaling(false);
  }
}

export async function scaleDownClusterPod(
  podId,
  setClusterPods,
  pushToast
) {

  pushToast(
    `Scaling down ${podId}...`
  );

  await new Promise((res) =>
    setTimeout(res, 1200)
  );

  setClusterPods((prev) =>
    prev.filter((x) => x.id !== podId)
  );

  pushToast(
    "Cluster node removed successfully",
    "success"
  );
}