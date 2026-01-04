// Enhanced Mood Analyzer - Natural, empathetic conversation
// Detects emotions and provides warm, human-like responses

class MoodAnalyzer {
    constructor() {
        this.conversationHistory = [];
        this.userMood = null;
        this.moodConfidence = 0;
    }

    // Main analysis function
    analyzeMessage(userMessage) {
        const lowerMessage = userMessage.toLowerCase().trim();
        
        // Store in conversation history
        this.conversationHistory.push({
            message: userMessage,
            timestamp: new Date()
        });

        // Detect mood from message
        const moodAnalysis = this.detectMood(lowerMessage);
        this.userMood = moodAnalysis.mood;
        this.moodConfidence = moodAnalysis.confidence;

        // Generate empathetic response
        const response = this.generateResponse(lowerMessage, moodAnalysis);

        return {
            mood: moodAnalysis.mood,
            confidence: moodAnalysis.confidence,
            emotion: moodAnalysis.emotion,
            response: response,
            moodReport: this.generateMoodReport(moodAnalysis),
            songRecommendations: this.recommendSongs(moodAnalysis.mood)
        };
    }

    // Deep mood detection with emotional intelligence
    detectMood(message) {
        const moodPatterns = {
            // HAPPY / JOYFUL
            happy: {
                keywords: ['happy', 'joy', 'excited', 'great', 'awesome', 'amazing', 'wonderful', 
                          'fantastic', 'celebration', 'party', 'fun', 'cheerful', 'bright', 
                          'energetic', 'positive', 'good', 'excellent'],
                emotions: ['joy', 'excitement', 'euphoria', 'contentment'],
                intensity: 0.9
            },

            // SAD / DOWN
            sad: {
                keywords: ['sad', 'down', 'depressed', 'lonely', 'hurt', 'pain', 'crying', 
                          'tears', 'heartbroken', 'low', 'blue', 'upset', 'disappointed',
                          'miserable', 'empty', 'hopeless', 'lost', 'broken'],
                emotions: ['sadness', 'grief', 'melancholy', 'loneliness'],
                intensity: 0.9
            },

            // ROMANTIC / LOVING
            romantic: {
                keywords: ['love', 'romantic', 'romance', 'heart', 'date', 'valentine', 
                          'crush', 'relationship', 'partner', 'boyfriend', 'girlfriend',
                          'soulmate', 'falling for', 'in love', 'miss you', 'thinking of'],
                emotions: ['love', 'affection', 'longing', 'tenderness'],
                intensity: 0.85
            },

            // ENERGETIC / PUMPED
            energetic: {
                keywords: ['energy', 'workout', 'gym', 'exercise', 'dance', 'party', 
                          'pump', 'motivated', 'active', 'moving', 'run', 'power',
                          'intense', 'vigorous', 'dynamic'],
                emotions: ['excitement', 'vigor', 'enthusiasm', 'determination'],
                intensity: 0.9
            },

            // CALM / RELAXED
            relaxing: {
                keywords: ['calm', 'relax', 'chill', 'peaceful', 'quiet', 'rest', 
                          'sleep', 'meditate', 'zen', 'tranquil', 'serene', 'gentle',
                          'soft', 'soothing', 'unwind', 'stress', 'tired'],
                emotions: ['peace', 'serenity', 'tranquility', 'relief'],
                intensity: 0.8
            },

            // STRESSED / OVERWHELMED
            stressed: {
                keywords: ['stress', 'overwhelmed', 'anxious', 'worried', 'nervous', 
                          'pressure', 'tension', 'busy', 'hectic', 'exhausted', 'tired',
                          'can\'t handle', 'too much', 'difficult'],
                emotions: ['anxiety', 'tension', 'worry', 'overwhelm'],
                intensity: 0.85
            },

            // ANGRY / FRUSTRATED
            angry: {
                keywords: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated',
                          'rage', 'hate', 'pissed', 'upset', 'fed up'],
                emotions: ['anger', 'frustration', 'irritation', 'rage'],
                intensity: 0.9
            }
        };

        // Count matches for each mood
        let moodScores = {};
        let bestMood = 'happy'; // default
        let maxScore = 0;
        let detectedEmotion = 'neutral';

        for (const [mood, data] of Object.entries(moodPatterns)) {
            let score = 0;
            let matchedKeywords = [];

            for (const keyword of data.keywords) {
                if (message.includes(keyword)) {
                    score += data.intensity;
                    matchedKeywords.push(keyword);
                }
            }

            moodScores[mood] = score;

            if (score > maxScore) {
                maxScore = score;
                bestMood = mood;
                detectedEmotion = data.emotions[0];
            }
        }

        // Calculate confidence (0-1 scale)
        const confidence = Math.min(maxScore / 2, 1);

        // If stressed, map to relaxing music
        if (bestMood === 'stressed') {
            bestMood = 'relaxing';
        }
        // If angry, map to energetic or relaxing based on context
        if (bestMood === 'angry') {
            bestMood = message.includes('want to scream') ? 'energetic' : 'relaxing';
        }

        return {
            mood: bestMood,
            emotion: detectedEmotion,
            confidence: confidence,
            alternativeMoods: Object.entries(moodScores)
                .filter(([m, s]) => s > 0 && m !== bestMood)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([m]) => m)
        };
    }

    // Generate warm, empathetic responses
    generateResponse(message, moodAnalysis) {
        const responses = {
            happy: [
                "I'm so happy to hear you're feeling great! 🌟 Your positive energy is contagious! Let me share some upbeat songs that'll make your day even brighter! 🎵",
                "What wonderful news! 😊 Your happiness made my day! I've got some cheerful tunes that'll match your amazing mood perfectly! 🎶",
                "Love your vibe! ✨ When you're happy, music just hits different, doesn't it? Let me pick some joyful songs for you! 🎵"
            ],

            sad: [
                "I'm really sorry you're going through this 💙. I'm here for you. Sometimes music can be a gentle friend when we're feeling down. Let me share some songs that understand... 🎵",
                "It sounds like you're having a tough time, and that's completely okay 💛. You're not alone. Let me find some songs that might comfort your heart... 🎶",
                "I hear you, and your feelings are valid 💙. Music has this beautiful way of healing. Let me share some gentle songs that might help... 🎵"
            ],

            romantic: [
                "Aww, love is in the air! 💕 Whether it's a special someone or just loving life, I've got the perfect romantic playlist for your heart! 🎵",
                "That's so sweet! 💖 Love makes everything beautiful. Let me share some romantic melodies that'll touch your soul! 🎶",
                "Your heart seems to be singing! 💕 I love it! Let me find some dreamy love songs that match your feelings! 🎵"
            ],

            energetic: [
                "Whoa, I can feel your energy from here! ⚡ That's the spirit! Let me give you some power-packed songs that'll keep you pumped! 🎵",
                "You're on fire! 🔥 Love that energy! Here come some high-octane tracks that'll take your workout to the next level! 🎶",
                "Yes! That's the attitude! 💪 Let me fuel your energy with some intense, powerful music! Get ready to move! 🎵"
            ],

            relaxing: [
                "I can sense you need some peace right now 🌸. Take a deep breath... Let me create a calming atmosphere with some gentle music 🎵",
                "Rest is important, my friend 🌙. Let me help you unwind with some peaceful, soothing melodies... You deserve this calm 🎶",
                "It's okay to slow down sometimes 🍃. Let me share some tranquil songs that'll help you relax and find your center 🎵"
            ],

            stressed: [
                "You sound really overwhelmed right now, and I'm here for you 💚. Let me help you find some calm through music... Deep breaths 🎵",
                "I hear you - things sound really hectic 💙. Music can be a wonderful escape. Let me share some calming songs to help you decompress 🎶",
                "You're dealing with a lot 💛. It's okay to take a moment for yourself. Let me create a peaceful sanctuary with some gentle music 🎵"
            ],

            angry: [
                "I understand you're feeling frustrated right now 💙. Your feelings are valid. Would you like intense music to release that energy, or calming music to find peace? 🎵",
                "It's okay to be angry - it's human 💚. Let me help you channel that energy. Should we go with powerful music or soothing calm? 🎶"
            ]
        };

        const moodResponses = responses[moodAnalysis.mood] || responses.happy;
        const response = moodResponses[Math.floor(Math.random() * moodResponses.length)];

        return response;
    }

    // Generate mood report
    generateMoodReport(moodAnalysis) {
        const moodDescriptions = {
            happy: "You're radiating positive energy! Your happiness is evident in your words. This is a great time to enjoy uplifting music!",
            sad: "You're experiencing sadness or melancholy. It's okay to feel this way - your emotions are valid. Music can be a comforting companion.",
            romantic: "Your heart is full of love and tenderness. You're in a romantic, dreamy state of mind - perfect for beautiful love songs!",
            energetic: "You're full of energy and motivation! You're ready to take on the world. High-energy music will amplify your power!",
            relaxing: "You're seeking peace and tranquility. Your mind and body need rest and gentle care. Calming music will help you find your zen.",
            stressed: "You're feeling overwhelmed and need relief. Taking time to breathe and relax with soothing music can help you recharge.",
            angry: "You're experiencing strong emotions of frustration. It's important to acknowledge and process these feelings healthily."
        };

        return {
            mood: moodAnalysis.mood,
            emotion: moodAnalysis.emotion,
            confidence: Math.round(moodAnalysis.confidence * 100) + '%',
            description: moodDescriptions[moodAnalysis.mood],
            alternativeMoods: moodAnalysis.alternativeMoods
        };
    }

    // Recommend songs based on mood
    recommendSongs(mood) {
        if (window.realMusicPlayer) {
            return window.realMusicPlayer.getSongsByMood(mood).slice(0, 3);
        }
        return [];
    }

    // Display mood report in chat
    displayMoodReport(moodReport) {
        const reportHtml = `
            <div class="mood-report-card">
                <h3>🎭 Your Mood Analysis</h3>
                <div class="mood-info">
                    <div class="mood-badge mood-${moodReport.mood}">
                        ${this.getMoodEmoji(moodReport.mood)} ${moodReport.mood.toUpperCase()}
                    </div>
                    <div class="confidence-badge">
                        Confidence: ${moodReport.confidence}
                    </div>
                </div>
                <div class="mood-description">
                    <p>${moodReport.description}</p>
                </div>
                ${moodReport.alternativeMoods.length > 0 ? `
                    <div class="alternative-moods">
                        <small>Also detected: ${moodReport.alternativeMoods.join(', ')}</small>
                    </div>
                ` : ''}
            </div>
        `;

        if (window.addBotMessage) {
            window.addBotMessage(reportHtml);
        }
    }

    // Get emoji for mood
    getMoodEmoji(mood) {
        const emojis = {
            happy: '😊',
            sad: '💙',
            romantic: '💕',
            energetic: '⚡',
            relaxing: '🌸',
            stressed: '💚',
            angry: '💪'
        };
        return emojis[mood] || '🎵';
    }
}

// Create global instance
window.moodAnalyzer = new MoodAnalyzer();

console.log('🎭 Mood Analyzer loaded successfully!');
console.log('✅ Empathetic conversation enabled');
console.log('✅ Emotional intelligence active');
