export default function LogsViewer({

  logs,
  onClose,

}) {

  return (

    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="w-[90%] max-w-5xl max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-4xl font-black text-white">
            Workflow Logs
          </h2>

          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl text-white"
          >
            Close
          </button>

        </div>

        <div className="space-y-6">

          {logs.length === 0 ? (

            <div className="text-zinc-400">
              No logs available
            </div>

          ) : (

            logs.map((log, index) => (

              <div
                key={index}
                className="bg-black/40 border border-zinc-800 rounded-2xl p-5"
              >

                <div className="flex items-center justify-between mb-3">

                  <span className="text-orange-400 font-bold uppercase">
                    {log.agent}
                  </span>

                  <span className="text-zinc-500 text-sm">
                    {log.status}
                  </span>

                </div>

                <p className="text-zinc-300 whitespace-pre-wrap">
                  {log.message}
                </p>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}