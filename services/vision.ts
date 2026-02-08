import Constants from 'expo-constants';

interface VisionResult {
  fen: string;
  confidence: number;
  orientation: 'white' | 'black';
}

function getApiKey(): string {
  const key =
    Constants.expoConfig?.extra?.anthropicApiKey ??
    process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      'Anthropic API key not configured. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file.'
    );
  }
  return key;
}

export async function extractFenFromImage(
  base64Image: string
): Promise<VisionResult> {
  const apiKey = getApiKey();
  const mediaType = base64Image.startsWith('/9j') ? 'image/jpeg' : 'image/png';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Analyze this chess board image. Identify every piece on the board, determine the board orientation (which color is at the bottom), and convert the position to FEN notation.

Rules:
- Uppercase letters = white pieces (K, Q, R, B, N, P)
- Lowercase letters = black pieces (k, q, r, b, n, p)
- Numbers represent consecutive empty squares
- Rows are separated by /
- FEN goes from rank 8 (top) to rank 1 (bottom) from White's perspective

Output ONLY valid JSON with no other text:
{"fen": "<full FEN string including active color, castling, en passant, halfmove, fullmove>", "confidence": <0.0 to 1.0>, "orientation": "<white or black>"}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 401) {
      throw new Error('Invalid API key. Check your Anthropic API key in Settings.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    throw new Error(`Vision API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;

  if (!text) {
    throw new Error('No response received from vision analysis.');
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse position from image. Please try a clearer photo.');
  }

  const result: VisionResult = JSON.parse(jsonMatch[0]);

  if (!result.fen || typeof result.fen !== 'string') {
    throw new Error('Invalid FEN received. Please try scanning again.');
  }

  return result;
}
