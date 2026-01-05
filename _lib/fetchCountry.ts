export async function fetchCountry() {
    try {
      const res = await fetch(`https://ipinfo.io/json?token=${process.env.NEXT_PUBLIC_IP_INFO_API_KEY}`);
      const data = await res.json();
      return `${data.city}, ${data.country}`;
    } catch (e) {
      console.error("Failed to fetch location", e);
      return '';
    }
  }
