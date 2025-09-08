// Este manipulador usa a sintaxe do Vercel Node.js runtime (req, res).
export default async function handler(req: any, res: any) {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_KEY!;

    const baseHeaders = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    };

    if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).json({ message: 'Variáveis de ambiente do Supabase não configuradas.' });
    }

    try {
        const { method } = req;

        switch (method) {
            case 'GET': {
                // Busca a contagem atual de visitantes
                const fetchRes = await fetch(`${supabaseUrl}/rest/v1/analytics?select=visitor_count&id=eq.1`, { 
                    headers: { ...baseHeaders, 'Accept': 'application/vnd.pgrst.object+json' } // Para obter um único objeto
                });

                if (!fetchRes.ok) {
                    const errorText = await fetchRes.text();
                    console.error('Supabase GET error em /api/visits:', errorText);
                    // Isso pode acontecer se a tabela/linha não existir. Retorna 0 como fallback.
                    return res.status(200).json({ count: 0 });
                }

                const data = await fetchRes.json();
                return res.status(200).json({ count: data.visitor_count || 0 });
            }

            case 'POST': {
                // Incrementa a contagem de visitantes usando uma função RPC
                const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_visitor_count`, {
                    method: 'POST',
                    headers: baseHeaders,
                });

                if (!rpcRes.ok) {
                    const errorText = await rpcRes.text();
                    console.error('Supabase RPC error em /api/visits:', errorText);
                    // Não lança um erro para o cliente, apenas registra no log.
                    // A funcionalidade do site não deve ser comprometida.
                }
                
                return res.status(204).send(null);
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Método ${method} não permitido.`);
        }

    } catch (error: unknown) {
        console.error('Erro na API de visitas:', error);
        // Retorna um erro genérico, mas não quebra o cliente
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}
