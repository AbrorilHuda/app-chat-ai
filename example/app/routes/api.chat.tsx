import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
    const API_KEY = process.env.OPENAI_API_KEY; // ← AMAN di server

    const { model, messages } = await request.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`, // ← Ini tidak terlihat di browser
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages })
    });

    return response.json();
}