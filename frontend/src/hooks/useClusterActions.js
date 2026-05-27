import {
  provisionClusterPod,
  scaleDownClusterPod,
} from "../services/clusterService";

export default function useClusterActions({
  pushToast,

  clusterPods,
  setClusterPods,

  setIsClusterScaling,
}) {

  // ADD POD
  const handleProvisionPod =
    async () => {

      await provisionClusterPod(
        clusterPods,

        setClusterPods,
        setIsClusterScaling,

        pushToast
      );
    };

  // REMOVE POD
  const handleScaleDownPod =
    async (podId) => {

      await scaleDownClusterPod(
        podId,

        setClusterPods,

        pushToast
      );
    };

  return {
    handleProvisionPod,
    handleScaleDownPod,
  };
}