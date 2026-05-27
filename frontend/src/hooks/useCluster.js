import { useState } from "react";

export default function useCluster() {

  const [clusterPods, setClusterPods] =
    useState([
      {
        id: "pod_core_01",
        name: "sb-orchestrator-gateway",
        status: "online",
        load: 24,
        ram: "4.2GB",
      },

      {
        id: "pod_core_02",
        name: "sb-ingress-proxy-balancer",
        status: "online",
        load: 12,
        ram: "2.1GB",
      },

      {
        id: "pod_agent_01",
        name: "sb-agent-runtime-planner",
        status: "online",
        load: 45,
        ram: "8.5GB",
      },

      {
        id: "pod_agent_02",
        name: "sb-agent-runtime-coder",
        status: "online",
        load: 18,
        ram: "12.3GB",
      },

      {
        id: "pod_sandbox_01",
        name: "sb-fastapi-sandbox-port8000",
        status: "standby",
        load: 0,
        ram: "1.2GB",
      },

      {
        id: "pod_mongodb_01",
        name: "sb-mongodb-auth-cache",
        status: "online",
        load: 38,
        ram: "6.8GB",
      },
    ]);

  const [
    isClusterScaling,
    setIsClusterScaling,
  ] = useState(false);

  return {

    clusterPods,
    setClusterPods,

    isClusterScaling,
    setIsClusterScaling,
  };
}