import { CREAM_DARK, INK, INK_SOFT, SAGE_DARK } from "./adminTheme";

export function AdminLoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4"
        style={{
          width: "28px",
          height: "28px",
          border: `2px solid ${CREAM_DARK}`,
          borderTopColor: SAGE_DARK,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p className="text-sm" style={{ color: INK_SOFT }}>{message}</p>
    </div>
  );
}

export function AdminErrorState({
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg font-medium mb-2" style={{ color: INK }}>{message}</p>
      <p className="text-sm mb-5" style={{ color: INK_SOFT }}>
        Please try again in a moment.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm px-4 py-2 border"
          style={{
            borderColor: CREAM_DARK,
            background: "#fff",
            color: SAGE_DARK,
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
