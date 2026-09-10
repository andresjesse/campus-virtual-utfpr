import messages from "@/constants/messages.json";

function extractResponsePayload(error: unknown) {
  const response =
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null
      ? error.response
      : null;

  const responseMessage =
    response &&
    "message" in response &&
    typeof response.message === "string"
      ? response.message.trim()
      : "";

  const fieldMessage =
    response &&
    "data" in response &&
    typeof response.data === "object" &&
    response.data !== null &&
    "name" in response.data &&
    typeof response.data.name === "object" &&
    response.data.name !== null &&
    "message" in response.data.name &&
    typeof response.data.name.message === "string"
      ? response.data.name.message.trim()
      : "";

  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 0;

  return { fieldMessage, responseMessage, status };
}

export function getRequestErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return messages.errors.generic;
  }

  const { fieldMessage, responseMessage, status } =
    extractResponsePayload(error);
  const combinedMessage = `${responseMessage} ${fieldMessage}`.trim();

  if (
    combinedMessage &&
    /duplicat|unique constraint|already exists|já existe|existente/i.test(
      combinedMessage,
    )
  ) {
    return messages.errors.duplicate;
  }

  if (combinedMessage && /[áàâãéêíóôõúç]/i.test(combinedMessage)) {
    return combinedMessage;
  }

  if (status === 400) {
    return messages.errors.badRequest;
  }

  if (status === 401) {
    return messages.errors.unauthenticated;
  }

  if (status === 403) {
    return messages.errors.forbidden;
  }

  if (status === 404) {
    return messages.errors.notFound;
  }

  if (status >= 500) {
    return messages.errors.server;
  }

  return messages.errors.network;
}