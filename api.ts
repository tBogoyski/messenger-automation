export async function getRandomQuote() {
    try {
      const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
        headers: {
          'X-Api-Key': process.env.API_NINJAS_KEY || ''
        }
      });
      if (response.ok) {
        const quotes = await response.json();
        return `"${quotes[0].quote}" - ${quotes[0].author}`;
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  }
  
  export async function getRandomDadJoke() {
    try {
      const response = await fetch('https://icanhazdadjoke.com/', {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const jokeData = await response.json();
        return jokeData.joke;
      }
    } catch (error) {
      console.error('Error fetching dad joke:', error);
    }
  }