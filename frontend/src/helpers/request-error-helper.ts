import messages from "@/constants/messages.json";

export type RequestErrorKind =
  | "duplicate"
  | "serverMessage"
  | "badRequest"
  | "unauthenticated"
  | "forbidden"
  | "notFound"
  | "server"
  | "network"
  | "generic";

// A domain supplies only the states it wants to reword; the rest fall back to
// messages.errors. `serverMessage` is excluded: that text comes from pb_hooks.
export type RequestErrorMessages = Partial<
  Record<Exclude<RequestErrorKind, "serverMessage">, string>
>;

export type RequestFieldError = {
  code: string;
  message: string;
};

const UNIQUE_VIOLATION_CODE = "validation_not_unique";

const DUPLICATE_MESSAGE_PATTERN =
  /duplicat|unique constraint|must be unique|already exists|já existe|existente/i;

// pb_hooks answers in pt-BR, so an accented message is ours and worth showing verbatim.
const SERVER_MESSAGE_PATTERN = /[áàâãéêíóôõúç]/i;

function getResponse(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null
    ? (error.response as Record<string, unknown>)
    : null;
}

export function getRequestFieldErrors(
  error: unknown,
): Record<string, RequestFieldError> {
  const data = getResponse(error)?.data;

  if (typeof data !== "object" || data === null) return {};

  return Object.entries(data).reduce<Record<string, RequestFieldError>>(
    (fieldErrors, [field, value]) => {
      if (typeof value !== "object" || value === null) return fieldErrors;

      const { code, message } = value as Record<string, unknown>;

      fieldErrors[field] = {
        code: typeof code === "string" ? code : "",
        message: typeof message === "string" ? message.trim() : "",
      };

      return fieldErrors;
    },
    {},
  );
}

function getServerMessage(error: unknown) {
  const response = getResponse(error);

  if (!response) return error instanceof Error ? error.message.trim() : "";

  const responseMessage = response.message;
  const fieldMessages = Object.values(getRequestFieldErrors(error))
    .map((fieldError) => fieldError.message)
    .join(" ");

  return `${typeof responseMessage === "string" ? responseMessage : ""} ${fieldMessages}`.trim();
}

function getStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : 0;
}

export function getRequestErrorKind(error: unknown): RequestErrorKind {
  if (typeof error !== "object" || error === null) return "generic";

  const fieldErrors = Object.values(getRequestFieldErrors(error));
  const serverMessage = getServerMessage(error);

  if (
    fieldErrors.some((fieldError) => fieldError.code === UNIQUE_VIOLATION_CODE) ||
    DUPLICATE_MESSAGE_PATTERN.test(serverMessage)
  ) {
    return "duplicate";
  }

  if (serverMessage && SERVER_MESSAGE_PATTERN.test(serverMessage)) {
    return "serverMessage";
  }

  const status = getStatus(error);

  if (status === 400) return "badRequest";
  if (status === 401) return "unauthenticated";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status >= 500) return "server";

  return "network";
}

export function getRequestErrorMessage(
  error: unknown,
  domainMessages?: RequestErrorMessages,
): string {
  const kind = getRequestErrorKind(error);

  if (kind === "serverMessage") return getServerMessage(error);

  return domainMessages?.[kind] ?? messages.errors[kind];
}
