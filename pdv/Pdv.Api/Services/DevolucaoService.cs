using Microsoft.EntityFrameworkCore;
using Pdv.Api.Data;
using Pdv.Api.DTOs;
using Pdv.Api.Models;

namespace Pdv.Api.Services;

public class DevolucaoService(AppDbContext db)
{
    public List<Devolucao> ListarPorVenda(int vendaId) =>
        [.. db.Devolucoes
            .Include(d => d.Itens)
            .Where(d => d.VendaId == vendaId)
            .OrderByDescending(d => d.Data)];

    public (Devolucao? devolucao, string? erro) Registrar(int vendaId, DevolucaoRequest req)
    {
        if (req.Itens is null || req.Itens.Count == 0)
            return (null, "Informe ao menos um item para devolução.");

        // Agrega itens duplicados pelo mesmo produtoId antes de qualquer validação.
        // Impede que duas entradas com o mesmo produto burlem a checagem de saldo.
        var itens = req.Itens
            .GroupBy(i => i.ProdutoId)
            .Select(g => new DevolucaoItemRequest
            {
                ProdutoId  = g.Key,
                Quantidade = g.Sum(x => x.Quantidade)
            })
            .ToList();

        var venda = db.Vendas.Include(v => v.Itens).FirstOrDefault(v => v.Id == vendaId);
        if (venda is null)
            return (null, "Venda não encontrada.");

        // Carrega TODAS as devoluções anteriores desta venda de uma só vez
        var devolucoesDaVenda = db.Devolucoes
            .Include(d => d.Itens)
            .Where(d => d.VendaId == vendaId)
            .ToList();

        // Valida todos os itens ANTES de mexer no estoque
        foreach (var itemReq in itens)
        {
            if (itemReq.Quantidade <= 0)
                return (null, "Quantidade deve ser maior que zero.");

            var vendaItem = venda.Itens.FirstOrDefault(i => i.ProdutoId == itemReq.ProdutoId);
            if (vendaItem is null)
                return (null, $"Produto Id={itemReq.ProdutoId} não encontrado nesta venda.");

            // Sanity check: nunca pode devolver mais do que foi vendido originalmente
            if (itemReq.Quantidade > vendaItem.Quantidade)
                return (null,
                    $"'{vendaItem.NomeProduto}': quantidade solicitada ({itemReq.Quantidade}) " +
                    $"excede o total vendido ({vendaItem.Quantidade}).");

            int jaDevolvido = devolucoesDaVenda
                .SelectMany(d => d.Itens)
                .Where(i => i.ProdutoId == itemReq.ProdutoId)
                .Sum(i => i.Quantidade);

            int saldoDisponivel = vendaItem.Quantidade - jaDevolvido;

            if (itemReq.Quantidade > saldoDisponivel)
                return (null,
                    $"'{vendaItem.NomeProduto}': disponível para devolução = {saldoDisponivel} " +
                    $"(vendido: {vendaItem.Quantidade}, já devolvido: {jaDevolvido}).");
        }

        // Tudo válido — aplica alterações (usa a lista agregada, não req.Itens)
        var devolucaoItens = new List<DevolucaoItem>();

        foreach (var itemReq in itens)
        {
            var vendaItem = venda.Itens.First(i => i.ProdutoId == itemReq.ProdutoId);

            var produto = db.Produtos.FirstOrDefault(p => p.Id == itemReq.ProdutoId);
            if (produto is not null)
                produto.Estoque += itemReq.Quantidade;

            db.Movimentacoes.Add(new EstoqueMovimentacao
            {
                ProdutoId = itemReq.ProdutoId,
                NomeProduto = vendaItem.NomeProduto,
                Tipo = "Entrada",
                Quantidade = itemReq.Quantidade,
                LocalCompra = $"Devolucao - Venda #{vendaId}",
                Data = DateTime.UtcNow
            });

            devolucaoItens.Add(new DevolucaoItem
            {
                ProdutoId = itemReq.ProdutoId,
                NomeProduto = vendaItem.NomeProduto,
                Quantidade = itemReq.Quantidade
            });
        }

        var devolucao = new Devolucao
        {
            VendaId = vendaId,
            Data = DateTime.UtcNow,
            Itens = devolucaoItens
        };

        db.Devolucoes.Add(devolucao);
        db.SaveChanges();
        return (devolucao, null);
    }
}
