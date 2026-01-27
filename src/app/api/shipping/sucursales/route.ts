import { NextRequest, NextResponse } from "next/server"

function normalizar(texto: string) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

async function getCorreoArgentinoToken() {
    try {
        const res = await fetch(`${process.env.CORREOARG_BASE_URL}/v1/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.CORREOARG_CLIENT_ID,
                client_secret: process.env.CORREOARG_CLIENT_SECRET
            })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.accessToken;
    } catch (e) {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const carrier = searchParams.get("carrier")?.toUpperCase();
    const provincia = normalizar(searchParams.get("provincia") || "");
    const localidad = normalizar(searchParams.get("localidad") || "");

    if (!carrier || !provincia || !localidad) return NextResponse.json({ sucursales: [] });

    try {
        if (carrier === "ANDREANI") {
            const res = await fetch(
                `${process.env.ANDREANI_BASE_URL}/v2/sucursales?localidad=${encodeURIComponent(localidad)}&provincia=${encodeURIComponent(provincia)}`,
                { headers: { 'X-Authorization': process.env.ANDREANI_API_KEY || '' } }
            );
            if (!res.ok) throw new Error("Andreani error");
            const data = await res.json();
            return NextResponse.json({
                sucursales: (data || []).map((s: any) => ({
                    id: s.numero.toString(),
                    nombre: s.descripcion,
                    direccion: `${s.direccion} ${s.numero}`,
                }))
            });
        }

        if (carrier === "CORREO_ARGENTINO") {
            const token = await getCorreoArgentinoToken();
            if (!token) return NextResponse.json({ error: "Error de autenticación Correo Argentino" }, { status: 401 });

            const res = await fetch(
                `${process.env.CORREOARG_BASE_URL}/v1/agencies?localidad=${encodeURIComponent(localidad)}&provincia=${encodeURIComponent(provincia)}&pickup_availability=true`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error("Correo Argentino error");
            const data = await res.json();
            return NextResponse.json({
                sucursales: (data || []).map((p: any) => ({
                    id: p.id.toString(),
                    nombre: p.name,
                    direccion: p.address,
                }))
            });
        }

        return NextResponse.json({ sucursales: [] });
    } catch (error) {
        console.error("❌ Error en búsqueda:", error);
        return NextResponse.json({ error: "No se pudieron obtener sucursales", details: String(error) }, { status: 500 });
    }
}