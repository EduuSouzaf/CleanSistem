using Pdv.Api.Data;

namespace Pdv.Api.Services;

public class RelatorioService
{
    public object VendasDia()
    {
        var hoje = DateTime.Today;
        var vendasHoje = FakeDatabase.Vendas
            .Where(v => v.Data.Date == hoje)
            .ToList();

        var topProdutos = vendasHoje
            .SelectMany(v => v.Itens)
            .GroupBy(i => new { i.ProdutoId, i.NomeProduto })
            .Select(g => new
            {
                nome = g.Key.NomeProduto,
                quantidade = g.Sum(i => i.Quantidade)
            })
            .OrderByDescending(x => x.quantidade)
            .Take(10)
            .ToList();

        return new
        {
            quantidadeVendas = vendasHoje.Count,
            totalVendido = vendasHoje.Sum(v => v.Total),
            topProdutos
        };
    }

    public object Estoque()
    {
        var estoque = FakeDatabase.Produtos
            .Select(p => new
            {
                p.Id,
                p.Nome,
                p.CodigoBarras,
                p.Estoque,
                p.PrecoCusto,
                p.PrecoVenda
            })
            .OrderBy(p => p.Nome)
            .ToList();

        return new
        {
            totalItens = estoque.Count,
            produtos = estoque
        };
    }
}
