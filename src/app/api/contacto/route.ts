import { getAccommodations } from '../../../lib/accommodations';
import { handleInquiry } from '../../../lib/inquiry.mjs';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  return handleInquiry(request, {
    getItems: getAccommodations,
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.CONTACT_FROM_EMAIL,
  });
}
