using Pdv.Api.Data;
using Pdv.Api.DTOs;
using Pdv.Api.Models;

namespace Pdv.Api.Services;

public class VendaService
{
    public List<Venda> ListarTodas() => FakeDatabase.Vendas;

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
                produto = FakeDatabase.Produtos.FirstOrDefault(p => p.Id == itemReq.ProdutoId.Value);
            else if (!string.IsNullOrWhiteSpace(itemReq.CodigoBarras))
                produto = FakeDatabase.Produtos.FirstOrDefault(p => p.CodigoBarras == itemReq.CodigoBarras);

            if (produto is null)
                return (null, $"Produto não encontrado (Id={itemReq.ProdutoId}, Código={itemReq.CodigoBarras}).");

            if (itemReq.Quantidade <= 0)
                return (null, $"Quantidade inválida para o produto '{produto.Nome}'.");

            if (produto.Estoque < itemReq.Quantidade)
                return (null, $"Estoque insuficiente para '{produto.Nome}'. Disponível: {produto.Estoque}.");

            produto.Estoque -= itemReq.Quantidade;

            FakeDatabase.Movimentacoes.Add(new EstoqueMovimentacao
            {
                Id = FakeDatabase.NextMovId(),
                ProdutoId = produto.Id,
                NomeProduto = produto.Nome,
                Tipo = "Saida",
                Quantidade = itemReq.Quantidade,
                Data = DateTime.Now
            });

            itens.Add(new VendaItem
            {
                ProdutoId = produto.Id,
                NomeProduto = produto.Nome,
                Quantidade = itemReq.Quantidade,
                PrecoUnitario = itemReq.PrecoUnitario > 0 ? itemReq.PrecoUnitario : produto.PrecoVenda
            });
        }

        var total = itens.Sum(i => i.Subtotal);

        var venda = new Venda
        {
            Id = FakeDatabase.NextVendaId(),
            TipoPagamento = req.TipoPagamento,
            Total = total,
            Data = DateTime.Now,
            Itens = itens
        };

        FakeDatabase.Vendas.Add(venda);
        return (venda, null);
    }
}
