import { getRandomAnimeQuote, shareQuote } from '../services/animeQuotes.js';

class AnimeQuote {
    constructor() {
        this.quote = null;
        this.isVisible = false;
        this.init();
    }

    async init() {
        // Create quote container
        this.container = document.createElement('div');
        this.container.className = 'anime-quote-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        // Create quote icon
        this.quoteIcon = document.createElement('div');
        this.quoteIcon.className = 'quote-icon';
        this.quoteIcon.innerHTML = '"';
        this.quoteIcon.style.cssText = `
            cursor: pointer;
            font-size: 40px;
            font-family: Georgia, serif;
            font-weight: bold;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 12px;
            border-radius: 50%;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            color: rgba(255, 255, 255, 0.95);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
            transform: rotate(180deg);
            line-height: 1;
            position: relative;
            top: -2px;
        `;

        // Create quote popup
        this.popup = document.createElement('div');
        this.popup.className = 'quote-popup';
        this.popup.style.cssText = `
            display: none;
            position: absolute;
            left: 60px;
            top: 0;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            padding: 20px;
            border-radius: 16px;
            max-width: 320px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        `;

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 8px;
            margin-top: 15px;
        `;

        // Create share button
        this.shareButton = document.createElement('button');
        this.shareButton.innerHTML = 'Share';
        this.shareButton.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
            flex: 1;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        // Create refresh button
        this.refreshButton = document.createElement('button');
        this.refreshButton.innerHTML = '🔄 New Quote';
        this.refreshButton.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
            flex: 1;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        // Add hover effects
        const addHoverEffect = (element) => {
            element.addEventListener('mouseover', () => {
                element.style.background = 'rgba(255, 255, 255, 0.15)';
                element.style.transform = 'translateY(-1px)';
                element.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                element.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            });
            element.addEventListener('mouseout', () => {
                element.style.background = 'rgba(255, 255, 255, 0.1)';
                element.style.transform = 'translateY(0)';
                element.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                element.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            });
        };

        // Add hover effect for quote icon separately to maintain rotation
        this.quoteIcon.addEventListener('mouseover', () => {
            this.quoteIcon.style.background = 'rgba(255, 255, 255, 0.15)';
            this.quoteIcon.style.transform = 'translateY(-1px) rotate(180deg)';
            this.quoteIcon.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            this.quoteIcon.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        });
        this.quoteIcon.addEventListener('mouseout', () => {
            this.quoteIcon.style.background = 'rgba(255, 255, 255, 0.1)';
            this.quoteIcon.style.transform = 'translateY(0) rotate(180deg)';
            this.quoteIcon.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            this.quoteIcon.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        });

        addHoverEffect(this.shareButton);
        addHoverEffect(this.refreshButton);

        // Add event listeners
        this.quoteIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleQuote();
        });
        this.shareButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleShare();
        });
        this.refreshButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.loadQuote();
        });

        // Add click outside listener
        document.addEventListener('click', (e) => {
            if (this.isVisible && !this.popup.contains(e.target) && !this.quoteIcon.contains(e.target)) {
                this.hideQuote();
            }
        });

        // Assemble the component
        buttonContainer.appendChild(this.refreshButton);
        buttonContainer.appendChild(this.shareButton);
        this.popup.appendChild(buttonContainer);
        this.container.appendChild(this.quoteIcon);
        this.container.appendChild(this.popup);
        document.body.appendChild(this.container);

        // Load initial quote
        await this.loadQuote();
    }

    async loadQuote() {
        this.quote = await getRandomAnimeQuote();
        if (this.quote) {
            this.updatePopupContent();
        }
    }

    updatePopupContent() {
        if (!this.quote) return;
        
        const content = `
            <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 10px 0; font-style: italic; font-size: 16px; line-height: 1.5; color: #fff; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);">"${this.quote.quote}"</p>
                <p style="margin: 0; font-size: 14px; font-weight: 500; color: #fff; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);">- ${this.quote.character}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.9); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);">${this.quote.show}</p>
            </div>
        `;
        this.popup.innerHTML = content;
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 8px;
            margin-top: 15px;
        `;
        buttonContainer.appendChild(this.refreshButton);
        buttonContainer.appendChild(this.shareButton);
        this.popup.appendChild(buttonContainer);
    }

    toggleQuote() {
        if (this.isVisible) {
            this.hideQuote();
        } else {
            this.showQuote();
        }
    }

    showQuote() {
        if (this.quote) {
            this.popup.style.display = 'block';
            this.quoteIcon.style.transform = 'scale(1.1) rotate(180deg)';
            this.isVisible = true;
        }
    }

    hideQuote() {
        this.popup.style.display = 'none';
        this.quoteIcon.style.transform = 'scale(1) rotate(180deg)';
        this.isVisible = false;
    }

    handleShare() {
        if (this.quote) {
            shareQuote(this.quote);
        }
    }
}

export { AnimeQuote }; 