"""LLM client – generates AI insights and compliments."""
from __future__ import annotations

import json
import logging
import textwrap
from typing import Any

from backend.utils.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Genre-specific knowledge base (fallback when LLM is not configured)
# ---------------------------------------------------------------------------
GENRE_KNOWLEDGE: dict[str, dict[str, Any]] = {
    "Blues": {
        "characteristics": ["Call-and-response patterns", "12-bar blues structure", "Bent notes and vibrato", "Pentatonic scales"],
        "instruments": ["Electric guitar", "Harmonica", "Piano", "Double bass", "Drums"],
        "rhythm": "Shuffle rhythm with a swinging 12/8 feel, often slow to mid-tempo.",
        "mood": "Soulful, melancholic, and deeply expressive — music that speaks from the heart.",
        "recommendations": ["B.B. King", "Muddy Waters", "Robert Johnson", "Stevie Ray Vaughan"],
        "similar_artists": ["B.B. King", "Muddy Waters", "John Lee Hooker", "Buddy Guy", "Son House"],
        "compliment": "You have soulful, authentic taste. Your playlist speaks straight from the heart — raw, real, and timeless.",
    },
    "Classical": {
        "characteristics": ["Formal musical structures", "Dynamic range variation", "Orchestral textures", "Complex harmonic progressions"],
        "instruments": ["Violin", "Cello", "Piano", "Flute", "French Horn", "Oboe"],
        "rhythm": "Highly varied — from flowing legato phrases to precise staccato passages and dramatic crescendos.",
        "mood": "Elegant, sophisticated, and emotionally expansive — music built for eternity.",
        "recommendations": ["Beethoven", "Mozart", "Bach", "Chopin", "Debussy"],
        "similar_artists": ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Frédéric Chopin"],
        "compliment": "Elegant choices never go out of style. Your taste is timeless, refined, and utterly sophisticated.",
    },
    "Country": {
        "characteristics": ["Storytelling lyrics", "Twangy guitar tone", "Pedal steel sounds", "Major key melodies"],
        "instruments": ["Acoustic guitar", "Pedal steel guitar", "Fiddle", "Banjo", "Dobro"],
        "rhythm": "Steady 4/4 backbeat with a relaxed, rolling feel — made for open roads and summer evenings.",
        "mood": "Warm, authentic, and narrative-driven — music that feels like home.",
        "recommendations": ["Johnny Cash", "Dolly Parton", "Willie Nelson", "Hank Williams"],
        "similar_artists": ["Johnny Cash", "Dolly Parton", "Willie Nelson", "Merle Haggard", "Emmylou Harris"],
        "compliment": "Down-to-earth with incredible depth — your taste is genuine gold. Real music for real people.",
    },
    "Disco": {
        "characteristics": ["Four-on-the-floor kick drum", "Syncopated basslines", "Lush string arrangements", "Funk-influenced rhythms"],
        "instruments": ["Electric bass", "Drums", "Strings", "Synthesizer", "Electric guitar", "Brass"],
        "rhythm": "Driving 4/4 pulse with syncopated hi-hats and an infectious, danceable groove.",
        "mood": "Euphoric, celebratory, and irresistibly fun — pure golden-age dance floor energy.",
        "recommendations": ["Donna Summer", "Bee Gees", "Gloria Gaynor", "Chic"],
        "similar_artists": ["Donna Summer", "Bee Gees", "Gloria Gaynor", "Earth Wind & Fire", "Chic"],
        "compliment": "Your energy is electric and your groove is legendary. You were clearly born to dance under a mirror ball.",
    },
    "Hip-Hop": {
        "characteristics": ["Sampling culture", "Rhythmic vocal delivery", "Heavy bass presence", "Looped percussion"],
        "instruments": ["Drum machine", "Sampler", "Turntable", "Synthesizer", "808 bass"],
        "rhythm": "Syncopated boom-bap or trap patterns with intricate hi-hat rolls and hard-hitting kicks.",
        "mood": "Confident, expressive, and culturally resonant — music that moves both body and mind.",
        "recommendations": ["Kendrick Lamar", "Jay-Z", "Nas", "J Dilla"],
        "similar_artists": ["Kendrick Lamar", "Jay-Z", "Nas", "J. Cole", "MF DOOM"],
        "compliment": "Your vibe is confident, rhythmic, and effortlessly cool. You've got legendary taste that commands respect.",
    },
    "Jazz": {
        "characteristics": ["Complex chord voicings", "Improvisation", "Swing feel", "Modal scales"],
        "instruments": ["Saxophone", "Trumpet", "Piano", "Double bass", "Drums", "Trombone"],
        "rhythm": "Swinging triplet feel with polyrhythmic interplay between instruments and spontaneous improvisation.",
        "mood": "Smooth, intellectual, and emotionally layered — the music of late nights and deep conversations.",
        "recommendations": ["Miles Davis", "John Coltrane", "Herbie Hancock", "Bill Evans"],
        "similar_artists": ["Miles Davis", "John Coltrane", "Herbie Hancock", "Bill Evans", "Thelonious Monk"],
        "compliment": "Smooth, sophisticated, and timeless — your taste speaks volumes. You're the most interesting person in the room.",
    },
    "Metal": {
        "characteristics": ["High-gain distorted guitars", "Complex time signatures", "Double bass drumming", "Powerful dynamics"],
        "instruments": ["Electric guitar (high gain)", "Bass guitar", "Drums with double bass", "Vocals (clean or harsh)"],
        "rhythm": "Aggressive, driving rhythms with blast beats, syncopated riffs, and intricate polyrhythmic patterns.",
        "mood": "Intense, powerful, and cathartic — music that channels raw energy into something transcendent.",
        "recommendations": ["Black Sabbath", "Metallica", "Iron Maiden", "Slayer"],
        "similar_artists": ["Black Sabbath", "Metallica", "Iron Maiden", "Pantera", "Tool"],
        "compliment": "You've got legendary rock energy. Your playlist belongs in an arena — intense, fearless, and absolutely electrifying.",
    },
    "Pop": {
        "characteristics": ["Hook-driven melodies", "Verse-chorus structure", "Polished production", "Wide dynamic range"],
        "instruments": ["Synthesizer", "Electric guitar", "Drums", "Bass", "Piano", "Vocals"],
        "rhythm": "Clean 4/4 backbeat with a focus on melodic hooks and anthemic, radio-friendly production.",
        "mood": "Bright, accessible, and universally appealing — music engineered to make you feel good.",
        "recommendations": ["Michael Jackson", "Madonna", "Dua Lipa", "The Weeknd"],
        "similar_artists": ["Michael Jackson", "Madonna", "Ariana Grande", "Harry Styles", "Dua Lipa"],
        "compliment": "You've got impeccable mainstream taste with a flair for the anthemic. Your playlist is everyone's guilty pleasure.",
    },
    "Reggae": {
        "characteristics": ["Offbeat rhythmic guitar (skank)", "Prominent bass melodies", "Lyrical social commentary", "Relaxed tempo"],
        "instruments": ["Rhythm guitar", "Bass guitar", "Drums", "Keyboard", "Horns"],
        "rhythm": "Laid-back one-drop rhythm with emphasis on the third beat and distinctive offbeat guitar chops.",
        "mood": "Peaceful, positive, and spiritually uplifting — music that carries a message of love and unity.",
        "recommendations": ["Bob Marley", "Peter Tosh", "Burning Spear", "Jimmy Cliff"],
        "similar_artists": ["Bob Marley", "Peter Tosh", "Burning Spear", "Toots and the Maytals", "Jimmy Cliff"],
        "compliment": "Your taste radiates positive vibrations. Cool, conscious, and beautifully laid-back — pure good energy.",
    },
    "Rock": {
        "characteristics": ["Guitar-driven sound", "Strong rhythmic backbeat", "Power chords", "Amplified instrumentation"],
        "instruments": ["Electric guitar", "Bass guitar", "Drums", "Vocals", "Keyboards"],
        "rhythm": "Driving 4/4 backbeat with powerful snare hits on 2 and 4, propelling the music forward.",
        "mood": "Energetic, rebellious, and liberating — music that makes you want to turn it up to 11.",
        "recommendations": ["Led Zeppelin", "The Rolling Stones", "Queen", "Foo Fighters"],
        "similar_artists": ["Led Zeppelin", "The Rolling Stones", "Queen", "Nirvana", "Foo Fighters"],
        "compliment": "You've got legendary rock energy. Your playlist belongs in a stadium — bold, powerful, and unapologetically epic.",
    },
}


class AIInsightsGenerator:
    def __init__(self):
        self._client = None
        self._provider = settings.LLM_PROVIDER

    def _get_client(self):
        if self._client is not None:
            return self._client
        if self._provider == "openai" and settings.OPENAI_API_KEY:
            import openai
            self._client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        elif self._provider == "anthropic" and settings.ANTHROPIC_API_KEY:
            import anthropic
            self._client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        return self._client

    async def generate(self, genre: str, confidence: float, features: dict) -> dict:
        """Generate AI insights. Uses LLM if configured, else knowledge base fallback."""
        try:
            client = self._get_client()
            if client is not None and self._provider != "mock":
                return await self._llm_generate(genre, confidence, features, client)
        except Exception as exc:  # noqa: BLE001
            logger.warning("LLM call failed (%s), using knowledge base fallback.", exc)

        return self._knowledge_base_generate(genre, confidence, features)

    async def _llm_generate(self, genre: str, confidence: float, features: dict, client) -> dict:
        tempo = features.get("tempo", 0)
        zcr = features.get("zero_crossing_rate_mean", 0)
        rms = features.get("rms_energy_mean", 0)
        centroid = features.get("spectral_centroid_mean", 0)

        prompt = textwrap.dedent(f"""
        You are a music theory expert and AI assistant for the Synesthesia music analysis platform.
        An audio file was classified as **{genre}** with {confidence*100:.1f}% confidence.

        Key audio features:
        - Tempo: {tempo:.1f} BPM
        - Zero Crossing Rate: {zcr:.4f}
        - RMS Energy: {rms:.4f}
        - Spectral Centroid: {centroid:.1f} Hz

        Respond with a JSON object containing exactly these keys:
        {{
          "explanation": "2-3 sentence explanation of why this genre was predicted",
          "characteristics": ["feature1", "feature2", "feature3", "feature4"],
          "instruments": ["instrument1", "instrument2", "instrument3"],
          "rhythm_patterns": "1-2 sentence description of the rhythm",
          "mood": "1 sentence mood description",
          "listening_recommendations": ["artist1", "artist2", "artist3"],
          "compliment": "A fun, personalized compliment about having this genre taste (max 2 sentences)",
          "similar_artists": ["artist1", "artist2", "artist3", "artist4", "artist5"]
        }}
        Return only valid JSON, no markdown.
        """)

        if self._provider == "openai":
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            return json.loads(response.choices[0].message.content)
        elif self._provider == "anthropic":
            response = await client.messages.create(
                model=settings.ANTHROPIC_MODEL,
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )
            return json.loads(response.content[0].text)

        raise ValueError(f"Unknown provider: {self._provider}")

    def _knowledge_base_generate(self, genre: str, confidence: float, features: dict) -> dict:
        kb = GENRE_KNOWLEDGE.get(genre, GENRE_KNOWLEDGE["Rock"])
        tempo = features.get("tempo", 120)
        explanation = (
            f"The audio was classified as {genre} with {confidence*100:.1f}% confidence. "
            f"Key indicators include a tempo of {tempo:.0f} BPM, along with spectral and rhythmic "
            f"characteristics strongly associated with {genre} music."
        )
        return {
            "explanation": explanation,
            "characteristics": kb["characteristics"],
            "instruments": kb["instruments"],
            "rhythm_patterns": kb["rhythm"],
            "mood": kb["mood"],
            "listening_recommendations": kb["recommendations"],
            "compliment": kb["compliment"],
            "similar_artists": kb["similar_artists"],
        }
