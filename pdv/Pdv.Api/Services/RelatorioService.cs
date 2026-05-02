using Microsoft.EntityFrameworkCore;
using Pdv.Api.Data;

namespace Pdv.Api.Services;

public class RelatorioService(AppDbContext db)
{
    public object VendasDia()
    {
        var hoje = DateTime.UtcNow.Date;
        var vendasHoje = db.Vendas
            .Include(v => v.Itens)
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
            .Take(5)
            .ToList();

        var formasPagamento = vendasHoje
            .GroupBy(v => v.TipoPagamento.ToUpper())
            .Select(g => new
            {
                tipo = g.Key,
                quantidade = g.Count(),
                total = g.Sum(v => v.Total)
            })
            .ToList();

        decimal totalVendido = vendasHoje.Sum(v => v.Total);
        int qtdVendas = vendasHoje.Count;
        decimal ticketMedio = qtdVendas > 0 ? totalVendido / qtdVendas : 0;

        return new
        {
            quantidadeVendas = qtdVendas,
            totalVendido,
            ticketMedio,
            topProdutos,
            formasPagamento
        };
    }

    public object ProdutosParados()
    {
        var dataLimite = DateTime.UtcNow.AddDays(-30);

        var produtosVendidos = db.Vendas
            .Where(v => v.Data >= dataLimite)
            .SelectMany(v => v.Itens.Select(i => i.ProdutoId))
            .Distinct()
            .ToHashSet();

        var parados = db.Produtos
            .Where(p => p.Estoque > 0 && !produtosVendidos.Contains(p.Id))
            .Select(p => new { p.Id, p.Nome, p.Estoque, p.PrecoVenda })
            .OrderByDescending(p => p.Estoque)
            .Take(20)
            .ToList();

        return new { diasSemVenda = 30, produtos = parados };
    }

    public object Estoque()
    {
        var todos = db.Produtos.ToList();
        var comEstoque = todos.Where(p => p.Estoque > 0).ToList();

        return new
        {
            totalItens = comEstoque.Sum(p => p.Estoque),
            valorCusto = comEstoque.Sum(p => p.PrecoCusto * p.Estoque),
            valorVenda = comEstoque.Sum(p => p.PrecoVenda * p.Estoque),
            produtos = todos.Select(p => new
            {
                p.Id, p.Nome, p.CodigoBarras, p.Estoque, p.PrecoCusto, p.PrecoVenda
            }).OrderBy(p => p.Nome).ToList()
        };
    }
}
