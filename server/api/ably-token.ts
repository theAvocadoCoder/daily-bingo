import Ably from 'ably';

export default defineEventHandler(async (event) => {
  const { clientId } = await readBody(event);
  const { ablyRoot } = useRuntimeConfig();

  try {
    const ably = new Ably.Rest({ key: ablyRoot });
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: `${clientId}`,
    });
    return tokenRequest;
  } catch (error) {
    console.error(error);
    setResponseStatus(event, 500, error as string);
  }
});
