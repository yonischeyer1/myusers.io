export const SET_LOADING_MESSAGE = 'SET_LOADING_MESSAGE';

export function setLoadingMessage(message: string) {
  return {
    type: SET_LOADING_MESSAGE,
    message
  };
}
