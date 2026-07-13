import { PAYMENT_API_URL, PAYMENT_PUBLIC_KEY } from '../../config/env';
import { CardFormValues } from '../../utils/cardValidation';

export class CardTokenizationError extends Error {}

/**
 * Tokenizes the raw card data directly against the gateway's public endpoint, using only
 * the public key. The raw PAN/CVC never reaches our own backend — only the resulting
 * token does (see backend README "Card tokenization happens client-side").
 */
export async function tokenizeCard(card: CardFormValues): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${PAYMENT_API_URL}/tokens/cards`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYMENT_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: card.number.replace(/\s+/g, ''),
        cvc: card.cvc,
        exp_month: card.expiryMonth,
        exp_year: card.expiryYear,
        card_holder: card.cardHolder,
      }),
    });
  } catch (error) {
    throw new CardTokenizationError(
      error instanceof Error ? error.message : 'No se pudo conectar con la pasarela de pago',
    );
  }

  const body = await response.json();

  if (!response.ok) {
    const errorBody = body as {
      error?: {
        type?: string;
        messages?: Record<string, string[]>;
      };
      status?: string;
    };

    if (errorBody.error?.messages) {
      const messages = Object.values(errorBody.error.messages).flat();
      throw new CardTokenizationError(messages.join('. '));
    }

    throw new CardTokenizationError('La tarjeta no fue aceptada. Verifica los datos e intenta con otra tarjeta.');
  }

  return (body as { data: { id: string } }).data.id;
}
