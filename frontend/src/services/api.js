const API_BASE_URL =
  "http://127.0.0.1:8000";


export async function analyzeAddress(address) {

  const response = await fetch(
    `${API_BASE_URL}/api/privacy/analyze`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        address: address,
      }),
    }
  );


  const data = await response.json();


  if (!response.ok) {

    throw new Error(
      data.detail ||
      "Unable to analyze address"
    );
  }


  return data;
}


export async function askAssistant(question) {

  const response = await fetch(
    `${API_BASE_URL}/api/chat`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        question: question,
      }),
    }
  );


  const data = await response.json();


  if (!response.ok) {

    throw new Error(
      data.detail ||
      "Unable to get AI response"
    );
  }


  return data;
}