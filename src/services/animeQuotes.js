const ANIME_QUOTES_API = 'https://yurippe.vercel.app/api/quotes';

export const getRandomAnimeQuote = async (character) => {
    try {
        const response = await fetch(`${ANIME_QUOTES_API}?random=1`);
        const data = await response.json();
        return data[0]; // API returns an array with one quote
    } catch (error) {
        console.error('Error fetching anime quote:', error);
        return null;
    }
};

export const shareQuote = (quote) => {
    const text = `"${quote.quote}" - ${quote.character} (${quote.show})`;
    if (navigator.share) {
        navigator.share({
            title: 'Anime Quote',
            text: text,
        }).catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(text)
            .then(() => alert('Quote copied to clipboard!'))
            .catch(console.error);
    }
}; 