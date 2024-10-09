import * as Ably from 'ably';

export default defineNuxtPlugin(() => {
  let ably: Ably.Realtime;

  // Function to fetch the token from the serverless function
  const fetchToken = async (clientId: string) => {
    const response = await fetch('/api/ably-token', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
      })
    });
    const token = await response.json();
    return token;
  };

  // Initialize Ably with the authCallback function
  const initAbly = async (clientId: string) => {
    // if (!ably) {
      ably = new Ably.Realtime({
        authCallback: async (tokenParams, callback) => {
          try {
            const tokenRequest = await fetchToken(clientId);
            callback(null, tokenRequest);
          } catch (error) {
            callback(error as string, null);
          }
        },
      });
    // }
    return ably;
  };

  // Provide Ably to the app
  return {
    provide: {
      ably: initAbly,
    },
  };
});
