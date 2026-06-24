import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'

export async function POST(request) {
    try {
        const headersList = await headers()
        const origin = headersList.get('origin')

        const session = await auth.api.getSession({
            headers: headersList
        });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        console.log('Checkout body received:', body) // debug

        const { bookingId, ticketTitle, amount, quantity } = body

        // fallback to prevent empty name error
        const productName = ticketTitle || 'Ghurni Ticket'
        const amountInBDT = Math.round(amount * 100)

        const checkoutSession = await stripe.checkout.sessions.create({
            customer_email: session.user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'bdt',
                        product_data: {
                            name: productName,
                            description: `${quantity} ticket(s) — ৳${Number(amount).toLocaleString()} BDT`,
                        },
                        unit_amount: amountInBDT,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                bookingId: bookingId?.toString(),
                userId: session.user.id,
                userEmail: session.user.email,
                originalAmountBDT: amount?.toString(),
            },
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/payment/cancel`,
        });

        return NextResponse.json({ url: checkoutSession.url })
    } catch (err) {
        console.error('Stripe error:', err.message)
        return NextResponse.json(
            { error: err.message },
            { status: err.statusCode || 500 }
        )
    }
}