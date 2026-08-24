const clientId = process.env.MAPPLS_CLIENT_ID;
const clientSecret = process.env.MAPPLS_CLIENT_SECRET;

async function getToken() {
  try {
    const res = await fetch("https://outpost.mapmyindia.com/api/security/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
}

getToken();
