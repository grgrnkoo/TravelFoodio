export async function fetchCountry(): Promise<{ code: string } | null> {
    try {
      const res = await fetch(`https://ipinfo.io/json?token=${process.env.NEXT_PUBLIC_IP_INFO_API_KEY}`);
      const data = await res.json();
      return { code: data.country || '' };
    } catch (e) {
      console.error("Failed to fetch location", e);
      return null;
    }
  }
