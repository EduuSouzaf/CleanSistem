using Microsoft.EntityFrameworkCore;
using Pdv.Api.Data;
using Pdv.Api.DTOs;
using Pdv.Api.Models;

namespace Pdv.Api.Services;

public class VendaService(AppDbContext db)
{
    public List<Venda> ListarTodas() =>
        [.. db.Vendas.Include(v => v.Itens).OrderByDescending(v => v.Data).Take(200)];

    public Venda? BuscarPorId(int id) =>
        db.Vendas.Include(v => v.Itens).FirstOrDefault(v => v.Id == id);

    public (Venda? venda, string? erro) Registrar(CriarVendaRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.TipoPagamento))
            return (null, "Tipo de pagamento é obrigatório.");

        if (req.Itens is null || req.Itens.Count == 0)
            return (null, "A venda deve ter pelo menos um item.");

        var itens = new List<VendaItem>();

        foreach (var itemReq in req.Itens)
        {
            Produto? produto = null;

            if (itemReq.ProdutoId.HasValue)
                produto = db.Produtos.FirstOrDefault(p => p.Id == itemReq.ProdutoId.Value);
            else if (!string.IsNullOrWhiteSpace(itemReq.CodigoBarras))
                produto = db.Produtos.FirstOrDefault(p => p.CodigoBarras == itemReq.CodigoBarras);

            if (produto is null)
                return (null, $"Produto não encontrado (Id={itemReq.ProdutoId}, Código={itemReq.CodigoBarras}).");

            if (itemReq.Quantidade <= 0)
                return (null, $"Quantidade inválida para o produto '{produto.Nome}'.");

            if (produto.Estoque < itemReq.Quantidade)
                return (null, $"Estoque insuficiente para '{produto.Nome}'. Disponível: {produto.Estoque}.");

            produto.Estoque -= itemReq.Quantidade;

            db.Movimentacoes.Add(new EstoqueMovimentacao
            {
                ProdutoId = produto.Id,
                NomeProduto = produto.Nome,
                Tipo = "Saida",
                Quantidade = itemReq.Quantidade,
                Data = DateTime.UtcNow
            });

            itens.Add(new VendaItem
            {
                ProdutoId = produto.Id,
                NomeProduto = produto.Nome,
                Quantidade = itemReq.Quantidade,
                PrecoUnitario = itemReq.PrecoUnitario > 0 ? itemReq.PrecoUnitario : produto.PrecoVenda,
                PrecoCusto = produto.PrecoCusto
            });
        }

        decimal subtotal = itens.Sum(i => i.Quantidade * i.PrecoUnitario);
        decimal desconto = Math.Min(Math.Max(0, req.Desconto), subtotal);
        decimal total = subtotal - desconto;
        decimal lucro = itens.Sum(i => (i.PrecoUnitario - i.PrecoCusto) * i.Quantidade) - desconto;

        var venda = new Venda
        {
            TipoPagamento = req.TipoPagamento,
            Subtotal = subtotal,
            Desconto = desconto,
            Total = total,
            Lucro = lucro,
            Data = DateTime.UtcNow,
            Itens = itens
        };

        db.Vendas.Add(venda);
        db.SaveChanges();
        return (venda, null);
    }

    public (bool ok, string? erro) Devolver(int vendaId, DevolucaoRequest req)
    {
        var venda = db.Vendas.Include(v => v.Itens).FirstOrDefault(v => v.Id == vendaId);
        if (venda is null)
            return (false, "Venda não encontrada.");

        if (req.Itens is null || req.Itens.Count == 0)
            return (false, "Informe ao menos um item para devolução.");

        foreach (var itemReq in req.Itens)
        {
            var vendaItem = venda.Itens.FirstOrDefault(i => i.ProdutoId == itemReq.ProdutoId);
            if (vendaItem is null)
                return (false, $"Produto Id={itemReq.ProdutoId} não encontrado nesta venda.");

            if (itemReq.Quantidade <= 0 || itemReq.Quantidade > vendaItem.Quantidade)
                return (false, $"Quantidade inválida para devolução de '{vendaItem.NomeProduto}' (máx: {vendaItem.Quantidade}).");

            var produto = db.Produtos.FirstOrDefault(p => p.Id == itemReq.ProdutoId);
            if (produto is not null)
                produto.Estoque += itemReq.Quantidade;

            db.Movimentacoes.Add(new EstoqueMovimentacao
            {
                ProdutoId = itemReq.ProdutoId,
                NomeProduto = vendaItem.NomeProduto,
                Tipo = "Entrada",
                Quantidade = itemReq.Quantidade,
                LocalCompra = $"Devolução - Venda #{vendaId}",
                Data = DateTime.UtcNow
            });
        }

        db.SaveChanges();
        return (true, null);
    }
}
