export async function POST(request) {
    return new Response(JSON.stringify({ message: 'Generate endpoint not implemented yet' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
    })
}
