export async function GET(request) {
    return new Response(JSON.stringify({ message: 'Feed GET not implemented yet' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
    })
}

export async function PUT(request) {
    return new Response(JSON.stringify({ message: 'Feed PUT not implemented yet' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
    })
}
